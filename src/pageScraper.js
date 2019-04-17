import cheerio from 'cheerio';
import { error, toIsoDateStr } from './util';

const WHITESPACE_RE = new RegExp(/\s\s+/, 'g');
const JOBS_RE = new RegExp('^/jobs/([0-9]+)$', 'i');

export default class PageScraper {
  scrapePage(html) {
    return new Promise((resolve) => {
      const jobs = [];
      const $ = cheerio.load(html);

      $('a').each((i, elem) => {
        const match = elem.attribs.href.match(JOBS_RE);
        if (match) {
          const job = PageScraper.scrapeJob($, elem, match[1]);
          if (job) jobs.push(job);
        }
      });
      resolve(jobs);
    });
  }

  static scrapeJob($, elem, jobId) {
    const job = {
      employer_job_id: PageScraper.scrapeStr($, '.job-number', elem),
      employer_name: PageScraper.scrapeStr($, '.job-brand', elem),
      title: PageScraper.scrapeStr($, '.job-title', elem, '-', 0),
      posted_at: toIsoDateStr(PageScraper.scrapeStr($, '.job-date-posted', elem)),
      location: PageScraper.scrapeStr($, '.job-location', elem),
    };

    if (Object.values(job).every(x => x !== '')) return job;

    // Print scraped job and id to investigate error
    error(`Failed to scrape jobId=${jobId}, job=${job}`);
    return false;
  }

  static scrapeStr($, className, parent, seperator = ':', idx = 1) {
    const text = $(className, parent).text();
    if (text.indexOf(seperator) === -1) return '';

    const parts = text.split(seperator);
    return parts.length > idx ? parts[idx].trim().replace(WHITESPACE_RE, ' ') : '';
  }
}
