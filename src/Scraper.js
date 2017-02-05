import cheerio from 'cheerio';
import retry from 'retry';
import ChallengeClient from './ChallengeClient';
import { error, log, toIsoDateStr } from './util';

const scraperError = (remainingIds, failedIds) => error(`Failed to scrape jobs.
remainingIds=${Array.from(remainingIds).toString()}
failedIds=${failedIds.toString()}`);

// Questions:
//  Don't hard-code PAGE_SIZE
//  Can I use libs to parse the html?

const PAGE_SIZE = 10;
const WHITESPACE_RE = new RegExp(/\s\s+/, 'g');
const JOBS_RE = new RegExp('^/jobs/([0-9]+)$', 'i');

export default class Scraper {
  constructor(client = new ChallengeClient()) {
    this.client = client;
    this.failedIds = [];
    this.jobIds = new Set();
  }

  run() {
    this.client
      .getJobIds()
      .then((ids) => {
        ids.forEach(id => this.jobIds.add(id));
        const jobPromises = this.scrapeJobs(ids.length / PAGE_SIZE);
        Promise.all(jobPromises)
          .then(() => {
            const failures = this.jobIds.size || this.failedIds.length;
            if (failures) scraperError(this.jobIds, this.failedIds);
            else this.client.completeChallenge().then(res => log(res));
          });
      });
  }

  scrapeJobs(pages) {
    return [...Array(pages)].map((_, i) => new Promise((resolve) => {
      const page = i + 1;
      this.faultTolerantGetJobs(page)
        .then(html => this.scrapePage(html))
        .then(jobs => this.client.createJobs(jobs, page)
          .then((res) => {
            if (res === true) jobs.forEach(job => this.jobIds.delete(job.employer_job_id));
            resolve();
          }));
    }));
  }

  faultTolerantGetJobs(page) {
    return new Promise((resolve) => {
      const op = retry.operation({ retries: 5 });
      op.attempt(() => {
        this.client.getJobs(page)
          .then(res => (res instanceof Error ? op.retry(res) : resolve(res)));
      });
    });
  }

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

  static scrapeStr($, cls, parent, sep = ':', idx = 1) {
    const text = $(cls, parent).text();
    if (text.indexOf(sep) === -1) return '';

    const parts = text.split(sep);
    return parts.length > idx ? parts[idx].trim().replace(WHITESPACE_RE, ' ') : '';
  }
}
