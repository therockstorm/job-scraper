import { assert } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import PageScraper from '../src/PageScraper';
import ChallengeClient from '../src/ChallengeClient';
import Scraper from '../src/Scraper';

const pageScraperStub = sinon.stub(new PageScraper());
let clientStub;
let scraper;

describe('run', () => {
  const IDS = ['id1', 'id2'];
  const HTML = '<html></html>';
  const JOBS = [{ employer_job_id: 'id1' }, { employer_job_id: 'id2' }];

  beforeEach(() => {
    clientStub = sinon.stub(new ChallengeClient());
    scraper = new Scraper(clientStub, pageScraperStub);

    clientStub.getJobIds.returns(Promise.resolve(IDS));
    clientStub.getJobs.withArgs(1).returns(Promise.resolve(HTML));
    pageScraperStub.scrapePage.withArgs(HTML).returns(Promise.resolve(JOBS));
    clientStub.createJobs.withArgs(JOBS).returns(Promise.resolve(true));
    clientStub.completeChallenge.returns(Promise.resolve(true));
  });

  it('completes challenge', () => (
    scraper.run().then(() => assert.isTrue(clientStub.completeChallenge.calledOnce))
  ));

  it('does not complete if not all ids returned', () => {
    const jobs = [{ employer_job_id: 'id1' }];
    pageScraperStub.scrapePage.withArgs(HTML).returns(Promise.resolve(jobs));
    clientStub.createJobs.withArgs(jobs).returns(Promise.resolve(true));

    return scraper.run().then(() => assert.isFalse(clientStub.completeChallenge.called));
  });

  it('does not complete if createJobs returns false', () => {
    clientStub.createJobs.withArgs(JOBS).returns(Promise.resolve(false));

    return scraper.run().then(() => assert.isFalse(clientStub.completeChallenge.called));
  });

  it('retries getJobs on failure', () => {
    clientStub.getJobs.withArgs(1).onFirstCall().returns(Promise.resolve(new Error()));
    clientStub.getJobs.withArgs(1).onSecondCall().returns(Promise.resolve(HTML));

    return scraper.run().then(() => assert.isTrue(clientStub.getJobs.withArgs(1).calledTwice));
  });

  it('gets multiple pages', () => {
    clientStub.getJobIds.returns(Promise.resolve(['id1', 'id2', 'id3', 'id4', 'id5', 'id6', 'id7', 'id8', 'id9', 'id10', 'id11']));
    clientStub.getJobs.withArgs(2).returns(Promise.resolve(HTML));

    return scraper.run().then(() => {
      assert.isTrue(clientStub.getJobs.withArgs(1).calledOnce);
      return assert.isTrue(clientStub.getJobs.withArgs(2).calledOnce);
    });
  });
});
