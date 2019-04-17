import { assert } from 'chai';
import { describe, it } from 'mocha';
import PageScraper from '../src/PageScraper';

describe('scrapePage', () => {
  it('scrapes page', () => {
    const expected = [{
      employer_job_id: '6a6e5522934047b742b8b85a049422ae',
      employer_name: 'Old Navy',
      title: 'Brand Associate',
      posted_at: '2017-02-03T00:00:00.000Z',
      location: 'Moen Stream Haleyberg, PW 19505-6761',
    }, {
      employer_job_id: '16021d0c9917798822213233920a560c',
      employer_name: 'Old Navy',
      title: 'Cashier',
      posted_at: '2017-02-04T00:00:00.000Z',
      location: 'Jared Ways North Wileychester, CO 49833-6001',
    }];

    return new PageScraper().scrapePage(FULL_HTML) // eslint-disable-line no-use-before-define
      .then(res => assert.deepEqual(res, expected));
  });

  it('return empty string if unable to parse', () => {
    const expected = [];
    const html =
      `<ul><li><a href="/jobs/10850">
          <span class="job-date-posted"><strong>Posted on -</strong> Feb 03, 2017</span>
          <span class="job-title">Brand Associate : Old Navy</span>
          <span class="job-number"><strong>Job# -</strong> 6a6e5522934047b742b8b85a049422ae</span>
          <span class="job-location"><strong>Primary Location -</strong> Moen Stream</br> Haleyberg, PW 19505-6761
          </span><span class="job-brand"><strong>Brand -</strong> Old Navy</span>
      </a></li></ul>`;

    return new PageScraper().scrapePage(html)
      .then(res => assert.deepEqual(res, expected));
  });
});

const FULL_HTML = `<!DOCTYPE html>
<html>
    <head>
        <title>LuJobScraper</title>
        <meta name="csrf-param" content="authenticity_token" />
        <meta name="csrf-token" content="T/1m2xHtiIZp1GutoWeD+Nl19VJk+8wFLryXkNy5RAe6qlUg48qgXvOtQ/oTFkIoUYq0s9AzduAfmXkjrB2xPA==" />
        <link rel="stylesheet" media="all" href="/assets/application-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.css" data-turbolinks-track="reload" />
        <script src="/assets/application-8b11081638198deab77a32df4381e654b3e66f7c683a2ca7d8b65d1663fad0b9.js" data-turbolinks-track="reload"></script>
        <link href="//tbcdn.talentbrew.com/company/1649/v1_0/fonts/fontawesome/css/font-awesome.min.css" rel="stylesheet"/>
        <link rel="stylesheet" href="//tbcdn.talentbrew.com/company/1649/css/2935-Full.css"/>
        <link rel="stylesheet" href="//tbcdn.talentbrew.com/company/1649/css/2935-OLD-NAVY.css"/>
    </head>
    <body>
        <main id="content">
            <article>
                <header class="nav-up">
                    <h2>Search
                        <strong>Results</strong>
                    </h2>
                </header>
                <div>
                    <section id="welcome">
                        <p>Old Navy makes current American fashion essentials accessible to every family. From day one, Old Navy was a revolution. We were something the world had never seen – fabulous, affordable fashion. Today, customers can find their must-have fashion essentials online, as well as in one of our 1,000+ stores globally.</p>
                    </section>
                    <section id="search-results">
                        <h1 role="status"></h1>
                        <section id="search-results-list">
                            <section id="applied-filters" class="search-results-options" aria-hidden="false" aria-expanded="true">
                                <h2 id="applied-filters-label">Filtered by</h2>
                                <ul aria-labelledby="applied-filters-label" tabindex="0" role="presentation">
                                    <li>
                                        <a class="filter-button" href="#" data-id="36678" data-facet-type="1">Old Navy</a>
                                    </li>
                                </ul>
                            </section>
                            <ul>
                                <li>
                                    <a href="/jobs/10850">
                                        <span class="job-date-posted">
                                            <strong>Posted on:</strong> Feb 03, 2017
                                        </span>
                                        <span class="job-title">Brand Associate - Old Navy</span>
                                        <span class="job-number">
                                            <strong>Job#:</strong> 6a6e5522934047b742b8b85a049422ae
                                        </span>
                                        <span class="job-location">
                                            <strong>Primary Location:</strong> Moen Stream
                                            </br> Haleyberg, PW 19505-6761
                                        </span>
                                        <span class="job-brand">
                                            <strong>Brand:</strong> Old Navy
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a href="/jobs/10843">
                                        <span class="job-date-posted">
                                            <strong>Posted on:</strong> Feb 04, 2017
                                        </span>
                                        <span class="job-title">Cashier - Old Navy</span>
                                        <span class="job-number">
                                            <strong>Job#:</strong> 16021d0c9917798822213233920a560c
                                        </span>
                                        <span class="job-location">
                                            <strong>Primary Location:</strong> Jared Ways
                                            </br> North Wileychester, CO 49833-6001
                                        </span>
                                        <span class="job-brand">
                                            <strong>Brand:</strong> Old Navy
                                        </span>
                                    </a>
                                </li>
                            </ul>
                        </section>
                        <section id="pagination-bottom" class="pagination" role="navigation">
                            <nav class="pagination">
                                <span class="page current">
  1
</span>
                                <span class="page">
                                    <a rel="next" href="/jobs?page=2">2</a>
                                </span>
                                <span class="page">
                                    <a href="/jobs?page=3">3</a>
                                </span>
                                <span class="page">
                                    <a href="/jobs?page=4">4</a>
                                </span>
                                <span class="page">
                                    <a href="/jobs?page=5">5</a>
                                </span>
                                <span class="page gap">&hellip;</span>
                                <span class="next">
                                    <a rel="next" href="/jobs?page=2">Next &rsaquo;</a>
                                </span>
                                <span class="last">
                                    <a href="/jobs?page=50">Last &raquo;</a>
                                </span>
                            </nav>
                        </section>
                    </section>
                </section>
            </div>
        </article>
    </main>
    <!-- git: 5cd285c5be -->

</body>
</html>`;
