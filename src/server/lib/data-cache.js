class DataCache {
  constructor(){
    this.data = null;
    this.lifeCycle = null;
    this.renewer = null;
  }

  /**
   * @param {Promise<any>} asyncFunction 
   */
  setRenewer(asyncFunction){
    this.renewer = asyncFunction;
  }

  setData(data){
    this.data = data;
  }

  isDataSet(){
    return !!this.data;
  }

  getData(){
    return this.data;
  }

  /**
   * @param {number} interval 
   */
  setLifeCycle(interval){
    this.clearLifeCycle();
    this.lifeCycle = setTimeout(() => {
      this.data = null;
    }, interval);
  }

  clearLifeCycle(){
    if(this.lifeCycle){
      clearTimeout(this.lifeCycle);
    }
  }

  async renew(){
    this.data = await this.renewer();
  }

  /**
   * @param {Promise<any>} asyncFunction 
   * @param {number} interval 
   */
  async setAutoRenewLifeCycleAsync(asyncFunction, interval){
    this.renewer = asyncFunction;
    await this.renew();
    this.lifeCycle = setInterval(async () => {
      await this.renew();
    }, interval);
  }

    /**
   * @param {Promise<any>} asyncFunction 
   * @param {number} interval 
   */
  async setAutoRenewLifeCycle(func, interval){
    this.renewer = func;
    this.renew();
    this.lifeCycle = setInterval(async () => {
      this.renew();
    }, interval);
  }

  clearAutoRenewLifeCycle(){
    clearInterval(this.lifeCycle);
  }
}

module.exports = DataCache;