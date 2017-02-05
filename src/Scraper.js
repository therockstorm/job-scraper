import cheerio from 'cheerio';
import retry from 'retry';
import ChallengeClient from './ChallengeClient';
import { error, log, toIsoDateStr } from './util';

const scraperError = (remainingIds, failedIds) => error(`Failed to scrape jobs.
remainingIds=${Array.from(remainingIds).toString()}
failedIds=${failedIds.toString()}`);

const PAGE_SIZE = 10;
const WHITESPACE_RE = new RegExp(/\s\s+/, 'g');
const JOBS_RE = new RegExp('^/jobs/([0-9]+)$', 'i');

export default class Scraper {
  constructor(client = new ChallengeClient()) {
    this.client = client;
    this.failedIds = [];
    this.jobIds = new Set();
  }

  /**
   * Gets ids to scrape, scapes them, and either logs errors or completes the challenge.
   */
  run() {
    this.client
      .getJobIds()
      .then((ids) => {
        ids.forEach(id => this.jobIds.add(id));
        Promise.all(this.scrapeJobs(ids.length / PAGE_SIZE))
          .then(() => {
            const errors = this.jobIds.size || this.failedIds.length;
            if (errors) scraperError(this.jobIds, this.failedIds);
            else this.client.completeChallenge().then(res => log(res));
          });
      });
  }

  /**
   * For each page of jobs, get the page, scrape it for jobs, and post each batch to Challenge API.
   * If the batch succeeds, remove the ides from the jobIds Set.
   * @param {Number} pages
   * @return {Promise[]} promises
   */
  scrapeJobs(pages) {
    return [...Array(pages)].map((_, i) => new Promise((resolve) => {
      const page = i + 1;
      this.getJobs(page)
        .then(html => this.scrapePage(html))
        .then(jobs => this.client.createJobs(jobs, page)
          .then((res) => {
            if (res === true) jobs.forEach(job => this.jobIds.delete(job.employer_job_id));
            resolve();
          }));
    }));
  }

  /**
   * Get jobs page retrying up to 5 times on error.
   * @param {Number} pages
   * @return {Promise<string>} html
   */
  getJobs(page) {
    return new Promise((resolve) => {
      const op = retry.operation({ retries: 5 });
      op.attempt(() => {
        this.client.getJobs(page)
          .then(res => (res instanceof Error ? op.retry(res) : resolve(res)));
      });
    });
  }

  /**
   * Scrape each matching 'a' tags on a jobs page.
   * @param {string} html
   * @return {Object} jobs
   */
  scrapePage(html) {
    return new Promise((resolve) => {
      const jobs = [];
      const $ = cheerio.load(html);

      $('a').each((i, elem) => {
        const match = elem.attribs.href.match(JOBS_RE);
        if (match) {
          const job = this.scrapeJob($, elem, match[1]);
          if (job) jobs.push(job);
        }
      });
      resolve(jobs);
    });
  }

  /**
   * Scrape an element. Add failures to failedIds.
   * @param {Object} $
   * @param {Object} elem
   * @param {Number} jobId
   * @return {Object} job
   */
  scrapeJob($, elem, jobId) {
    const job = {
      employer_job_id: Scraper.scrapeStr($, '.job-number', elem),
      employer_name: Scraper.scrapeStr($, '.job-brand', elem),
      title: Scraper.scrapeStr($, '.job-title', elem, '-', 0),
      posted_at: toIsoDateStr(Scraper.scrapeStr($, '.job-date-posted', elem)),
      location: Scraper.scrapeStr($, '.job-location', elem),
    };

    if (Object.values(job).every(x => x !== '')) return job;

    this.failedIds.push(jobId);
    return false;
  }

  /**
   * Scrape and normalize a string.
   * @param {Object} $
   * @param {string} cls
   * @param {Number} parent
   * @param {string} sep
   * @param {Number} idx
   * @return {string} str
   */
  static scrapeStr($, cls, parent, sep = ':', idx = 1) {
    const text = $(cls, parent).text();
    if (text.indexOf(sep) === -1) return '';

    const parts = text.split(sep);
    return parts.length > idx ? parts[idx].trim().replace(WHITESPACE_RE, ' ') : '';
  }
}
