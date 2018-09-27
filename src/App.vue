<template>
  <div id="app">
    <h1>為替: {{ yen }} / 1ドル</h1>

    <div>
      <p> <input type="text" @input="filter"/></p>
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

  get filterRows () {
    if (!this.value) {
      return _.sortBy(this.rows, [this.ysort]);
    }
    return _.sortBy(this.rows.filter(v => {
      const x = Number(v.price.USD) * Number(this.yen)
      return x < Number(this.value);
    }), [this.ysort]);
  }

  public filter(e: any) {
    this.value = e.target.value
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
    return Math.floor(mprice)
  }
}
</script>

<style lang="scss">
#app {
  font-size: 13px;
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
