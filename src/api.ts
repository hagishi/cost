import axios from 'axios';

interface IRate {
  open: string;
  currencyPairCode: string;
}

interface IAWSPrice {
  price: { USD: string };
  attributes: {
    'aws:ec2:instanceType': string;
    'aws:ec2:vcpu': string;
    'aws:ec2:memory': string;
  };
}

export default class {
  public async get(path: string) {
    const rs = await this.get(path);
  }

  public async getAwsCost(path: string): Promise<IAWSPrice[]> {
    const rs = await axios.get(path);
    return rs.data.prices;
  }

  public post() {
    // pass
  }

  public async getRate(): Promise<IRate | null> {
    const rs = await axios.get('/api/rate');
    const rates: IRate[] = rs.data.quotes;
    let obj: IRate | null = null;
    for (const item of rates) {
      if (item.currencyPairCode === 'USDJPY') {
        obj = item;
      }
    }
    return obj;
  }
}
