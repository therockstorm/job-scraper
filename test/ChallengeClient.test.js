import axios from 'axios';
import { assert } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import ChallengeClient from '../src/ChallengeClient';

const PAGE = 2;
const EMAIL = 'example@example.com';
const ERROR = new Error('Error occurred communicating with Scraper Challenge API.');
const postStub = sinon.stub(axios, 'post');
const getStub = sinon.stub(axios, 'get');
let client;

describe('getJobIds', () => {
  beforeEach(() => {
    client = new ChallengeClient();
    postStub.reset();
  });

  const RES = {
    data: {
      success: true,
      data: {
        token: 'myToken',
        assigned_job_ids: ['myJobId1', 'myJobId2'],
      },
    },
  };
  const ERR_RES = {
    response: {
      data: {
        success: false,
        error: [
          'Email can\'t be blank',
          'Email must be valid email',
        ],
      },
    },
  };
  const setup = () => postStub.withArgs('challenges', { data: { email: EMAIL } });
  const setupResolve = ret => setup().returns(Promise.resolve(ret));
  const setupReject = ret => setup().returns(Promise.reject(ret));

  it('gets ids', () => {
    setupResolve(RES);

    return client.getJobIds().then(res => assert.deepEqual(res, RES.data.data.assigned_job_ids));
  });

  it('returns error if success is false', () => {
    RES.data.success = false;
    setupResolve(RES);

    return client.getJobIds().then(res => assert.deepEqual(res, ERROR));
  });

  it('returns error if request fails', () => {
    setupReject(ERR_RES);

    return client.getJobIds().then(res => assert.deepEqual(res, ERROR));
  });
});

describe('getJobs', () => {
  beforeEach(() => {
    client = new ChallengeClient();
    getStub.reset();
  });

  const RES = { data: '<!DOCTYPE html><html></html>' };
  const ERR_RES = { response: { data: '<!DOCTYPE html><html></html>' } };
  const setup = () => getStub.withArgs('jobs', { params: { page: PAGE }, responseType: 'text' });
  const setupResolve = ret => setup().returns(Promise.resolve(ret));
  const setupReject = ret => setup().returns(Promise.reject(ret));

  it('gets jobs', () => {
    setupResolve(RES);

    return client.getJobs(PAGE).then(res => assert.deepEqual(res, RES.data));
  });

  it('returns error if request fails', () => {
    setupReject(ERR_RES);

    return client.getJobs(PAGE).then(res => assert.deepEqual(res, ERROR));
  });
});

describe('createJobs', () => {
  beforeEach(() => {
    client = new ChallengeClient();
    postStub.reset();
  });

  const BATCH = [
    { employer_job_id: '6a6e5522934047b742b8b85a049422ae' },
    { employer_job_id: '16021d0c9917798822213233920a560c' },
  ];
  const RES = { data: { success: true } };
  const ERR_RES = { response: { data: { success: false } } };
  const setup = () => postStub.withArgs('jobs/batch', { data: BATCH });
  const setupResolve = ret => setup().returns(Promise.resolve(ret));
  const setupReject = ret => setup().returns(Promise.reject(ret));

  it('create jobs', () => {
    setupResolve(RES);

    return client.createJobs(BATCH, PAGE).then(res => assert.deepEqual(res, RES.data.success));
  });

  it('returns error if success is false', () => {
    RES.data.success = false;
    setupResolve(RES);

    return client.createJobs(BATCH, PAGE).then(res => assert.deepEqual(res, ERROR));
  });

  it('returns error if request fails', () => {
    setupReject(ERR_RES);

    return client.createJobs(BATCH, PAGE).then(res => assert.deepEqual(res, ERROR));
  });
});

describe('completeChallenge', () => {
  beforeEach(() => {
    client = new ChallengeClient();
    postStub.reset();
  });

  const RES = { data: { success: true } };
  const ERR_RES = { response: { data: { success: false } } };
  const setup = () => postStub.withArgs('challenges/complete');
  const setupResolve = ret => setup().returns(Promise.resolve(ret));
  const setupReject = ret => setup().returns(Promise.reject(ret));

  it('completes challege', () => {
    setupResolve(RES);

    return client.completeChallenge().then(res => assert.deepEqual(res, RES.data.success));
  });

  it('returns error if success is false', () => {
    RES.data.success = false;
    setupResolve(RES);

    return client.completeChallenge().then(res => assert.deepEqual(res, ERROR));
  });

  it('returns error if request fails', () => {
    setupReject(ERR_RES);

    return client.completeChallenge().then(res => assert.deepEqual(res, ERROR));
  });
});
