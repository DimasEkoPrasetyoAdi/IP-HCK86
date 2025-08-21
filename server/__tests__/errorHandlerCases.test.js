const express = require('express');
const errorHandler = require('../middlewares/errorHandler');

const app = express();
app.get('/forbidden', (req,res,next)=>{ const e=new Error('No'); e.name='Forbidden'; next(e); });
app.get('/default-error', (req,res,next)=>{ next(new Error('Random boom')); });
app.get('/config-error', (req,res,next)=>{ const e=new Error('Config missing'); e.name='ConfigError'; next(e); });
app.get('/jwt-error', (req,res,next)=>{ const e=new Error('jwt malformed'); e.name='JsonWebTokenError'; next(e); });
app.use(errorHandler);

const request = require('supertest');

describe('Error handler switch cases', ()=>{
  test('Forbidden -> 403', async ()=>{
    const r = await request(app).get('/forbidden');
    expect(r.status).toBe(403);
  });
  test('ConfigError -> 500', async ()=>{
    const r = await request(app).get('/config-error');
    expect(r.status).toBe(500);
  });
  test('JsonWebTokenError -> 401', async ()=>{
    const r = await request(app).get('/jwt-error');
    expect(r.status).toBe(401);
  });
  test('Default path -> 500', async ()=>{
    const r = await request(app).get('/default-error');
    expect(r.status).toBe(500);
  });
});
