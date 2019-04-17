import retry from 'retry';
import ChallengeClient from './ChallengeClient';
import PageScraper from './PageScraper';
import { error } from './util';

const scraperError = ids => error(`Failed to scrape jobs. jobIds=${Array.from(ids).toString()}`);

// Could set PAGE_SIZE dynamically by making call to first page and counting matching 'a' tags
const PAGE_SIZE = 10;

export default class Scraper {
  constructor(client = new ChallengeClient(), pageScraper = new PageScraper()) {
    this.client = client;
    this.pageScraper = pageScraper;
    this.jobIds = new Set();
  }

  /**
   * Get ids to scrape, scape them, and either log errors or complete the challenge.
   */
  run() {
    return new Promise((resolve) => {
      this.client
        .getJobIds()
        .then((ids) => {
          ids.forEach(id => this.jobIds.add(id));
          Promise.all(this.scrapeJobs(ids.length))
            .then(() => resolve(this.logErrorsOrComplete()));
        });
    });
  }

  /**
   * For each page of jobs, get the page, scrape it for jobs, and post each batch to Challenge API.
   * If the batch succeeds, remove the ides from the jobIds Set.
   * @param {Number} numIds
   * @return {Promise[]} promises
   */
  scrapeJobs(numIds) {
    const pages = Math.ceil(numIds / PAGE_SIZE);
    return [...Array(pages)].map((_, i) => new Promise((resolve) => {
      const page = i + 1;
      this.getJobs(page)
        .then(html => this.pageScraper.scrapePage(html))
        .then(jobs => this.client.createJobs(jobs, page)
          .then((res) => {
            if (res === true) jobs.forEach(job => this.jobIds.delete(job.employer_job_id));
            resolve();
          }));
    }));
  }

  logErrorsOrComplete() {
    return new Promise((resolve) => {
      if (this.jobIds.size) {
        scraperError(this.jobIds);
        return resolve();
      }

      return this.client.completeChallenge().then(() => resolve());
    });
  }

  /**
   * Get jobs page retrying up to 5 times on error.
   * @param {Number} pages
   * @return {Promise<string>} html
   */
  getJobs(page) {
    return new Promise((resolve) => {
      const op = retry.operation({ retries: 5, minTimeout: 50, maxTimeout: 3000 });
      op.attempt(() => {
        this.client.getJobs(page)
          .then(res => (res instanceof Error ? op.retry(res) : resolve(res)));
      });
    });
  }
}
