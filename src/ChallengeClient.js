import axios from 'axios';
import { log, logAndCreateError } from './util';

const error = err => logAndCreateError(err, 'Error occurred communicating with Scraper Challenge API.');
const postChallengeError = data => error(`Failed posting challenge. ${JSON.stringify(data)}`);
const getJobsError = (page, data) => error(`Failed getting jobs for page=${page}. ${JSON.stringify(data)}`);
const postJobsError = (page, data) => error(`Failed posting jobs for page=${page}. ${JSON.stringify(data)}`);
const postCompleteError = data => error(`Failed posting complete. ${JSON.stringify(data)}`);

export default class ChallengeClient {
  constructor() {
    axios.defaults.baseURL = 'https://lu-scraper-challenge.herokuapp.com/';
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.defaults.timeout = 20000;
  }

  getJobIds() {
    return axios
      .post('challenges', { data: { email: 'x@y.z' } })
      .then((res) => {
        if (res.data && res.data.success && res.data.data) {
          this.setTokenHeader(res.data.data.token);
          return res.data.data.assigned_job_ids;
        }
        return postChallengeError(res.data);
      })
      .catch(err => postChallengeError(err.response.data));
  }

  getJobs(page) {
    return axios
      .get('jobs', { params: { page }, responseType: 'text' })
      .then(res => res.data)
      .catch(err => getJobsError(page, err.response));
  }

  createJobs(batch, page) {
    return axios
      .post('jobs/batch', { data: batch })
      .then(res => (res.data && res.data.success ? res.data.success : postJobsError(page, false)))
      .catch(err => postJobsError(page, err.response));
  }

  completeChallenge() {
    return axios
      .post('challenges/complete')
      .then((res) => {
        if (!res.data || !res.data.success) return postCompleteError(false);

        log(res.data.data);
        return res.data.success;
      })
      .catch(err => postCompleteError(err.response.data));
  }

  setTokenHeader(token) {
    log(token);
    axios.defaults.headers.common.Authorization = token;
  }
}
