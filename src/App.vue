<template>
  <div id="app">
    <h1>為替: {{ yen }} / 1ドル</h1>
    <h2>EC2</h2>
    <div class="form">
      <p><input type="text" class="input" @input="filter" placeholder="price"/></p>
        <p class="op"><select class="input" @change="filterPrice">
            <option :value="index" v-for="(option, index) in options" :key="index">{{ option }}</option>
          </select>
        </p>
    </div>

    <table>
      <tr>
        <th>type</th>
        <th>vCPU</th>
        <th>ECU</th>
        <th class="price">時間/円</th>
        <th class="price">日/円</th>
        <th class="price">月/円</th>
      </tr>
      <tr v-for="(row, index) in filterRows" :key="index">
        <td>{{ row.attributes['aws:ec2:instanceType'] }}</td>
        <td>{{ row.attributes['aws:ec2:vcpu'] }}</td>
        <td>{{ row.attributes['aws:ec2:memory'] }}</td>
        <td class="price">{{ money('hour', row.price.USD) }}円</td>
        <td class="price">{{ money('day', row.price.USD) }}円</td>
        <td class="price">{{ money('month', row.price.USD) }}円</td>
      </tr>
    </table>

  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as _ from 'lodash';
import API from '@/api'

@Component({
  components: {
  },
})
export default class App extends Vue {
  public yen: number = 0
  public api: API 
  public rows: any[] = []
  public value: string = '';
  public options = ['hour', 'day', 'month']
  public times = [1, 24, 720];
  public option = 0

  constructor() {
    super();
    this.api = new API();
  }

  public async created() {
    const data = await this.api.getRate();
    this.yen = Number(data!.open);

    this.rows = await this.api.getAwsCost('/api/aws/ec2');
  }

  public ysort(o: any) {
    return Number(o.price.USD);
  }

  public priceFilter(v: any) {
    const price = Number(v.price.USD) * Number(this.yen) * this.times[this.option]
    return price < Number(this.value);
  }

  get filterRows () {
    if (!this.value) {
      return _.sortBy(this.rows, [this.ysort]);
    }
    return _.sortBy(this.rows.filter(this.priceFilter), [this.ysort]);
  }

  public filter(e: any) {
    this.value = e.target.value
  }

  public filterPrice(e:any) {
    this.option = e.target.value
  }

  public money(type: string, price: string) {
    let mprice = 0;
    switch (type) {
      case 'hour':
        mprice = (this.yen * Number(price))
        break;
      case 'day':
        mprice= (this.yen * Number(price) * 24)
        break;
      case 'month':
        mprice = (this.yen * Number(price) * 24 * 30)
        break;
      default:
        break;
    }
    return mprice.toFixed(2)
  }
}
</script>

<style lang="scss">
#app {
  font-size: 13px;
}
.form {
  display: flex;
  align-items: center;
}
.op {
  margin: 0 0 0 10px;
}

.input {
  height: 30px;
  line-height: 30px;
  width: 120px;
  padding: 0 10px;
}
h1 {
  font-size: 18px;
}
th {
  background: #666;
  color: #fff;
}
th,
td {
  height: 30px;
  min-width: 80px;
  text-align: center;
}
.price {
  width: 100px;
  text-align: right;
  padding: 0 5px 0 0;
}
</style>
