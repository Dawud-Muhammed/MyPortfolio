import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createContactHandler} from '../api/contact.js';

// Real embedded PostgreSQL, fresh in-memory database. Never connects to any Supabase project.
test('additive migration, RLS, publication, relationships, durable accounting and throttles in PostgreSQL',async t=>{
 const db=new PGlite();
 try {
 await db.exec(`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
  CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('test.user_id',true),'')::uuid $$;
  GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;
  CREATE SCHEMA storage;
  CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
  CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text);
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  INSERT INTO storage.buckets(id,name,public) VALUES('portfolio-images','portfolio-images',true),('Portfolio-documents','Portfolio-documents',true),('portfolio-vidios','portfolio-vidios',true);
  GRANT USAGE ON SCHEMA storage TO anon,authenticated;
  GRANT SELECT,INSERT,UPDATE,DELETE ON storage.objects TO anon,authenticated;
  CREATE POLICY legacy_storage_writes ON storage.objects FOR ALL TO authenticated USING(true) WITH CHECK(true);
  INSERT INTO storage.objects(id,bucket_id) VALUES('30000000-0000-4000-8000-000000000001','portfolio-vidios');
  INSERT INTO auth.users VALUES('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');`);
 const dir=new URL('../supabase/migrations/',import.meta.url);
 for(const name of (await readdir(dir)).filter(n=>n.endsWith('.sql') && !n.startsWith('20261105')).sort()) await db.exec(await readFile(new URL(name,dir),'utf8'));
 await db.exec(`INSERT INTO projects(id,title,slug) VALUES('10000000-0000-4000-8000-000000000001','Existing test project','existing-test-project');
  INSERT INTO technologies(id,name) VALUES('20000000-0000-4000-8000-000000000001','Test technology');
  INSERT INTO project_technologies VALUES('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001');
  INSERT INTO blog_posts(title,slug,status,content) VALUES('Private draft','draft','Draft','Unpublished secret');
  INSERT INTO blog_comments(post_id,name,email,comment) SELECT id,'Visitor','private@example.test','Pending' FROM blog_posts LIMIT 1;
  INSERT INTO contact_messages(name,email,subject,message) VALUES('Test visitor','visitor@example.test','Test subject','Private test submission');
  GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO anon,authenticated,service_role;`);
 await db.exec(await readFile(new URL('20261105090000_systems_studio.sql',dir),'utf8'));
 const owner='00000000-0000-4000-8000-000000000001';
 const outsider='00000000-0000-4000-8000-000000000002';
 await db.query('INSERT INTO admin_users(user_id) VALUES($1)',[owner]);
 async function role(name,id,fn) {
  await db.exec(`SET ROLE ${name}`); await db.query("SELECT set_config('test.user_id',$1,false)",[id || '']);
  try{return await fn();}finally{await db.exec('RESET ROLE');}
 }
 await t.test('preserves IDs/relations and publishes legacy projects without publishing new drafts',async()=>{
  const result=await db.query('SELECT id,publication_status FROM projects');
  assert.equal(result.rows[0].id,'10000000-0000-4000-8000-000000000001');assert.equal(result.rows[0].publication_status,'published');
  assert.equal((await db.query('SELECT * FROM project_technologies')).rows.length,1);
  await db.exec("INSERT INTO projects(title,slug) VALUES('New draft','new-draft')");
  assert.equal((await db.query("SELECT publication_status FROM projects WHERE slug='new-draft'")).rows[0].publication_status,'draft');
  await db.exec("INSERT INTO skills(name) VALUES('New draft skill')");
  assert.equal((await db.query("SELECT is_published FROM skills WHERE name='New draft skill'")).rows[0].is_published,false);
 });
 await t.test('anon cannot read drafts, comment emails, submissions or write content',async()=>role('anon',null,async()=>{
  assert.equal((await db.query('SELECT * FROM projects')).rows.length,1);
  assert.equal((await db.query('SELECT * FROM blog_posts')).rows.length,0);
  assert.equal((await db.query('SELECT * FROM blog_comments')).rows.length,0);
  assert.equal((await db.query('SELECT * FROM contact_messages')).rows.length,0);
  await assert.rejects(db.query("INSERT INTO projects(title,slug) VALUES('Bad','bad')"));
  await assert.rejects(db.query('SELECT * FROM assistant_reservations'));
 }));
 await t.test('ordinary authenticated account is not an admin and cannot self-promote',async()=>role('authenticated',outsider,async()=>{
  assert.equal((await db.query('SELECT is_admin() AS result')).rows[0].result,false);
  assert.equal((await db.query('SELECT * FROM projects')).rows.length,1);
  await assert.rejects(db.query('INSERT INTO admin_users(user_id) VALUES($1)',[outsider]));
  await assert.rejects(db.query("INSERT INTO projects(title,slug) VALUES('Bad','bad')"));
  await assert.rejects(db.query('SELECT assistant_usage_summary()'));
  await assert.rejects(db.query("SELECT reserve_assistant_budget('x','y',100,500000,5000000,10000000)"));
 }));
 await t.test('admin edits, publish/unpublish and revision invalidation preserve data',async()=>role('authenticated',owner,async()=>{
  assert.equal((await db.query('SELECT is_admin() AS result')).rows[0].result,true);
  const before=(await db.query('SELECT revision FROM content_revision')).rows[0].revision;
  await db.query("UPDATE projects SET assistant_eligible=true,publication_status='draft' WHERE slug='existing-test-project'");
  const after=(await db.query('SELECT revision FROM content_revision')).rows[0].revision;
  assert(Number(after)>Number(before));
  assert.equal((await db.query('SELECT * FROM projects')).rows.length,2);
  assert.equal((await db.query('SELECT * FROM contact_messages')).rows.length,1);
 }));
 await t.test('unpublishing immediately removes public project and join rows',async()=>role('anon',null,async()=>{
  assert.equal((await db.query('SELECT * FROM projects')).rows.length,0);
  assert.equal((await db.query('SELECT * FROM project_technologies')).rows.length,0);
 }));
 await t.test('relationship replacement rolls back entirely on invalid foreign key',async()=>role('authenticated',owner,async()=>{
  await assert.rejects(db.query('SELECT save_project_technologies($1,$2)',[
   '10000000-0000-4000-8000-000000000001',['ffffffff-ffff-4fff-8fff-ffffffffffff']]));
  assert.equal((await db.query('SELECT * FROM project_technologies')).rows.length,1);
 }));
 await t.test('admin kill switch fails closed',async()=>{
  const response=await db.query("SELECT reserve_assistant_budget('session','client',100000,500000,5000000,10000000) AS result");
  assert.equal(response.rows[0].result.code,'disabled');
  await db.exec('UPDATE assistant_settings SET enabled=true');
 });
 await t.test('simultaneous submitted reservations cannot overrun the global allowance',async()=>{
  const results=await Promise.all(Array.from({length:12},(_,i)=>db.query(
   'SELECT reserve_assistant_budget($1,$2,100000,500000,5000000,10000000) AS result',[`session-${i}`,`client-${i}`])));
  assert.equal(results.filter(r=>r.rows[0].result.ok).length,5);
  assert.equal(Number((await db.query('SELECT sum(charged_microusd) AS total FROM assistant_reservations')).rows[0].total),500000);
  const id=results.find(r=>r.rows[0].result.ok).rows[0].result.id;
  await db.query('SELECT reconcile_assistant_budget($1,20000,100,50,$2)',[id,'test-request']);
  await db.query('SELECT reconcile_assistant_budget($1,0,0,0,$2)',[id,'duplicate']);
  assert.equal((await db.query('SELECT charged_microusd FROM assistant_reservations WHERE id=$1',[id])).rows[0].charged_microusd,20000);
 });
 await t.test('uncertain provider usage remains reserved and is reported',async()=>{
  const id=(await db.query("SELECT id FROM assistant_reservations WHERE status='reserved' LIMIT 1")).rows[0].id;
  await db.query('SELECT reconcile_assistant_budget($1,NULL,NULL,NULL,NULL)',[id]);
  const row=(await db.query('SELECT * FROM assistant_reservations WHERE id=$1',[id])).rows[0];
  assert.equal(row.status,'uncertain');assert.equal(row.charged_microusd,row.reserved_microusd);
  await role('authenticated',owner,async()=>{
   const summary=(await db.query('SELECT assistant_usage_summary() AS usage')).rows[0].usage;
   assert.equal(Number(summary.total_usd),0.42);assert.equal(summary.pending_requests,4);
  });
 });
 await t.test('durable throttles and server-only execution',async()=>{
  for(let i=0;i<3;i++)assert.equal((await db.query("SELECT studio_throttle('test-key',2,60) AS allowed")).rows[0].allowed,i<2);
  await role('anon',null,async()=>assert.rejects(db.query("SELECT studio_throttle('x',10,60)")));
 });
 await t.test('total allocation includes previous months permanently',async()=>{
  await db.exec("INSERT INTO assistant_reservations(created_at,session_hash,reserved_microusd,charged_microusd,status) VALUES(now()-interval '400 days','old-period',6000000,6000000,'completed')");
  const result=(await db.query("SELECT reserve_assistant_budget('new-month','new-client',100,500000,5000000,5000000) AS result")).rows[0].result;
  assert.equal(result.code,'budget_exhausted');
 });
 await t.test('storage limits and a separate public intro audio bucket are configured',async()=>{
  const rows=(await db.query('SELECT * FROM storage.buckets')).rows;
  assert.equal(rows.find(r=>r.id==='portfolio-images').file_size_limit,5242880);
  assert.equal(rows.find(r=>r.id==='portfolio-audio').public,true);
  assert(!rows.find(r=>r.id==='portfolio-images').allowed_mime_types.includes('image/svg+xml'));
  assert.equal(rows.find(r=>r.id==='portfolio-vidios').file_size_limit,52428800);
  assert(rows.find(r=>r.id==='portfolio-vidios').allowed_mime_types.includes('video/mp4'));
  assert.equal(rows.find(r=>r.id==='portfolio-vidios').public,true);
  assert.equal((await db.query("SELECT id FROM storage.objects WHERE bucket_id='portfolio-vidios'")).rows[0].id,'30000000-0000-4000-8000-000000000001');
  await role('authenticated',outsider,async()=>{
   await assert.rejects(db.query("INSERT INTO storage.objects(bucket_id) VALUES('portfolio-vidios')"));
   assert.equal((await db.query("DELETE FROM storage.objects WHERE bucket_id='portfolio-vidios' RETURNING id")).rows.length,0);
  });
  await role('authenticated',owner,async()=>{
   await db.query("INSERT INTO storage.objects(bucket_id) VALUES('portfolio-vidios')");
  });
 });
 await t.test('contact handler saves isolated messages and enforces the actual PostgreSQL rate limit',async()=>{
  const adapter={rpc:async(name,args)=>{
    assert.equal(name,'studio_throttle');
    const result=await db.query('SELECT studio_throttle($1,$2,$3) AS allowed',[args.p_key,args.p_limit,args.p_seconds]);
    return {data:result.rows[0].allowed,error:null};
   },from:table=>{assert.equal(table,'contact_messages');return {insert:async row=>{
    await db.query('INSERT INTO contact_messages(name,email,subject,message) VALUES($1,$2,$3,$4)',[row.name,row.email,row.subject,row.message]);
    return {error:null};
   }};}};
  const handler=createContactHandler({database:()=>adapter,env:{SITE_URL:'https://test.example',NODE_ENV:'test',ASSISTANT_SESSION_SECRET:'test-only-not-a-real-secret-with-32-characters'}});
  const message={name:'Integration test',email:'isolated@example.test',subject:'Staging fixture',message:'Local PostgreSQL fixture only.',website:'',startedAt:Date.now()-3000};
  for(let i=0;i<11;i++){
   const response={setHeader(){},status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}};
   await handler({method:'POST',headers:{origin:'https://test.example','content-type':'application/json'},body:message,socket:{remoteAddress:'fixture-network'}},response);
   assert.equal(response.statusCode,i<10?200:429);
  }
  assert.equal((await db.query("SELECT count(*) AS n FROM contact_messages WHERE email='isolated@example.test'")).rows[0].n,10);
 });
 await t.test('opt-in spelling correction and rollback preserve education identity, dates and publication',async()=>{
  await db.exec("INSERT INTO education(id,institution,degree,field,start_date,end_date) VALUES('40000000-0000-4000-8000-000000000001','Bahirdar Institue of technology','bachelor degree','nformation Technology','2024','2027')");
  const maintenance=new URL('../supabase/maintenance/',import.meta.url);
  await db.exec(await readFile(new URL('correct-verified-education-spelling.sql',maintenance),'utf8'));
  const row=(await db.query("SELECT * FROM education WHERE id='40000000-0000-4000-8000-000000000001'")).rows[0];
  assert.equal(row.institution,'Bahirdar Institute of Technology');assert.equal(row.field,'Information Technology');
  assert.equal(row.start_date,'2024');assert.equal(row.end_date,'2027');assert.equal(row.is_published,false);
  await db.exec(await readFile(new URL('rollback-verified-education-spelling.sql',maintenance),'utf8'));
  const restored=(await db.query("SELECT * FROM education WHERE id='40000000-0000-4000-8000-000000000001'")).rows[0];
  assert.equal(restored.institution,'Bahirdar Institue of technology');assert.equal(restored.field,'nformation Technology');
 });
 await t.test('follow-up restores undated published articles without exposing drafts, scheduled posts or comment emails',async()=>{
  await db.exec(await readFile(new URL('20261105110000_restore_undated_published_articles.sql',dir),'utf8'));
  await db.exec(`INSERT INTO blog_posts(title,slug,status,published_at) VALUES
    ('Legacy published','legacy-undated','Published',NULL),
    ('Dated published','dated-public','Published','2020-01-01'),
    ('Scheduled','future-private','Published','2999-01-01');
    INSERT INTO blog_comments(post_id,name,email,comment,status)
      SELECT id,'Test reader','private@example.test','Approved test comment','approved'
      FROM blog_posts WHERE slug IN ('legacy-undated','future-private','draft');`);
  const legacyId=(await db.query("SELECT id FROM blog_posts WHERE slug='legacy-undated'")).rows[0].id;
  await role('anon',null,async()=>{
    assert.deepEqual((await db.query('SELECT slug FROM blog_posts ORDER BY slug')).rows.map(r=>r.slug),['dated-public','legacy-undated']);
    const comments=(await db.query('SELECT * FROM published_blog_comments')).rows;
    assert.equal(comments.length,1);assert.equal(comments[0].post_id,legacyId);
    assert.equal('email' in comments[0],false);
    const deniedUpdate=await db.query("UPDATE blog_posts SET status='Published' WHERE slug='draft' RETURNING id");
    assert.equal(deniedUpdate.rows.length,0);
  });
  assert.equal((await db.query("SELECT status FROM blog_posts WHERE slug='draft'")).rows[0].status,'Draft');
  await role('authenticated',outsider,async()=>{
    assert.equal((await db.query("SELECT count(*)::int AS n FROM blog_posts")).rows[0].n,2);
    await assert.rejects(db.query("INSERT INTO blog_posts(title,slug) VALUES('Denied','denied')"));
  });
  await role('authenticated',owner,()=>db.query("UPDATE blog_posts SET status='Draft' WHERE id=$1",[legacyId]));
  await role('anon',null,async()=>{
    assert.equal((await db.query('SELECT * FROM blog_posts WHERE id=$1',[legacyId])).rows.length,0);
    assert.equal((await db.query('SELECT * FROM published_blog_comments')).rows.length,0);
  });
  assert.equal((await db.query('SELECT published_at FROM blog_posts WHERE id=$1',[legacyId])).rows[0].published_at,null);
 });
 } finally {await db.close();}
});
