<template>
  <main class="calculator-page" :class="{ 'is-dragging': draggingPai }">
    <section class="surface-panel lggc palette-panel">
      <div class="section-heading">
        <div>
          <p class="section-kicker">牌库</p>
          <h1>构建你的和牌</h1>
          <p class="section-description">点击牌面加入当前模式，也可以拖动到下方区域快速分区。</p>
        </div>
        <div class="gesture-note" :class="{ active: draggingPai }">
          <span class="gesture-dot"></span>
          {{ draggingPai ? `松开以${dropTargetLabel}` : '点击加牌 · 拖动可快速分区' }}
        </div>
      </div>

      <div class="tile-palette" aria-label="麻将牌库">
        <div v-for="row in paiName" :key="row.join('-')" class="tile-row">
          <pai-select
            v-for="pai in row"
            :key="pai"
            :name="pai"
            :data-testid="`palette-${pai}`"
            :disabled="isDisable[pai]"
            :class="{ disabled: isDisable[pai] }"
            @click="add(pai)"
            @drag-start="beginTileDrag"
            @drag-move="moveTileDrag"
            @drag-end="endTileDrag"
            @drag-cancel="cancelTileDrag"
          />
        </div>
      </div>
    </section>

    <section class="collections-grid">
      <section class="surface-panel lggc collection-panel collection-hand">
        <div class="collection-heading">
          <div>
            <span class="collection-title">手牌</span>
            <span class="collection-count">{{ hand.length }} 张</span>
          </div>
          <span class="collection-help">点击移除</span>
        </div>
        <div class="box drop-zone" :class="dropZoneClass('hand')" data-drop-target="hand" data-testid="drop-hand"
          @dragover.prevent="nativeDragOver('hand')" @drop.prevent="nativeDrop('hand')">
          <span v-if="!hand.length" class="drop-placeholder">拖动牌面到此处加入手牌</span>
          <pai-select v-for="(pai,index) in hand" :key="`${pai}-${index}`"
            :name="pai" @click="removeSingle(hand,pai)"></pai-select>
        </div>
      </section>

      <section class="surface-panel lggc collection-panel collection-furo">
        <div class="collection-heading">
          <div>
            <span class="collection-title">副露</span>
            <span class="collection-count">{{ furo.length }} 组</span>
          </div>
          <span class="collection-help">点击移除</span>
        </div>
        <div class="box" data-testid="drop-furo">
          <span v-if="!furo.length" class="drop-placeholder">从上方选择吃、碰或杠</span>
          <block-select v-for="(item, index) in furo" :key="index"
            :type="item.type" :name="item.name" @click="removeMulti(index)"></block-select>
        </div>
      </section>

      <section class="surface-panel lggc collection-panel">
        <div class="collection-heading">
          <div>
            <span class="collection-title">宝牌指示牌</span>
            <span class="collection-count">{{ dora.length }} / 5</span>
          </div>
          <span class="collection-help">点击移除</span>
        </div>
        <div class="box drop-zone" :class="dropZoneClass('dora')" data-drop-target="dora" data-testid="drop-dora"
          @dragover.prevent="nativeDragOver('dora')" @drop.prevent="nativeDrop('dora')">
          <span v-if="!dora.length" class="drop-placeholder">拖动牌面到此处加入</span>
          <pai-select v-for="(pai,index) in dora" :key="`${pai}-${index}`"
            :name="pai" @click="removeSingle(dora,pai)"></pai-select>
        </div>
      </section>

      <section class="surface-panel lggc collection-panel">
        <div class="collection-heading">
          <div>
            <span class="collection-title">里宝牌指示牌</span>
            <span class="collection-count">{{ ura.length }} / 5</span>
          </div>
          <span class="collection-help">点击移除</span>
        </div>
        <div class="box drop-zone" :class="dropZoneClass('ura')" data-drop-target="ura" data-testid="drop-ura"
          @dragover.prevent="nativeDragOver('ura')" @drop.prevent="nativeDrop('ura')">
          <span v-if="!ura.length" class="drop-placeholder">拖动牌面到此处加入</span>
          <pai-select v-for="(pai,index) in ura" :key="`${pai}-${index}`"
            :name="pai" @click="removeSingle(ura,pai)"></pai-select>
        </div>
      </section>

      <section class="surface-panel lggc collection-panel collection-nuki">
        <div class="collection-heading">
          <div>
            <span class="collection-title">拔北</span>
            <span class="collection-count">{{ nuki.length }} / 4</span>
          </div>
          <span class="collection-help">点击移除</span>
        </div>
        <div class="box drop-zone" :class="dropZoneClass('nuki')" data-drop-target="nuki" data-testid="drop-nuki"
          @dragover.prevent="nativeDragOver('nuki')" @drop.prevent="nativeDrop('nuki')">
          <span v-if="!nuki.length" class="drop-placeholder">拖动北牌到此处加入</span>
          <pai-select v-for="(pai,index) in nuki" :key="`${pai}-${index}`"
            :name="pai" @click="removeSingle(nuki,pai)"></pai-select>
        </div>
      </section>
    </section>

    <section class="editor-grid">
      <div class="surface-panel lggc control-panel">
        <div class="control-heading">
          <div>
            <p class="section-kicker">配置</p>
            <h2>和牌条件</h2>
            <p class="control-caption">先补齐牌型，再计算点数</p>
          </div>
          <span class="control-status" :class="{ ready: calculateEnable }">
            <span class="control-status-dot"></span>
            {{ calculateEnable ? '可以计算' : '等待牌型' }}
          </span>
        </div>

        <div class="action-row">
          <n-button class="pressable action-button clear-button" @click="clearAll()" type="error" ghost size="large">清空</n-button>
          <n-button class="pressable action-button calculate-button" @click="myCalculate()" type="primary" ghost size="large"
            :disabled="!calculateEnable">计算</n-button>
        </div>

        <div class="control-section field-section">
          <div class="control-section-heading">
            <div>
              <span class="control-section-title">牌型参数</span>
              <span class="control-section-note">基础条件</span>
            </div>
            <span class="section-index">01</span>
          </div>

          <div class="field-grid">
            <label class="field-row">
              <span>加入类型</span>
              <n-select v-model:value="mode" :options="optionMode"/>
            </label>
            <label class="field-row">
              <span>和了方式</span>
              <n-select v-model:value="agariWay" :options="optionAgariWay"/>
            </label>
            <label class="field-row">
              <span>场风</span>
              <n-select v-model:value="field" :options="optionWind"/>
            </label>
            <label class="field-row">
              <span>自风</span>
              <n-select v-model:value="seat" :options="optionWind"/>
            </label>
            <label class="field-row">
              <span>赤宝牌</span>
              <n-input-number v-model:value="red" size="large" :min="0"/>
            </label>
            <label class="field-row">
              <span>本场</span>
              <n-input-number v-model:value="ponba" size="large" :min="0" />
            </label>
          </div>
        </div>

        <div class="control-section yaku-block">
          <div class="control-section-heading">
            <div>
              <span class="control-section-title">役种</span>
              <span class="control-section-note">可选加成</span>
            </div>
            <span class="section-index">02</span>
          </div>
          <n-checkbox-group v-model:value="yakus" class="yaku-list">
            <n-checkbox v-for="item in yakuName" :key="item.value" size="large"
              :value="item.value" :label="item.name" :disabled="isYakuDisable[item.value]"/>
          </n-checkbox-group>
        </div>
      </div>

      <section id="result" class="surface-panel lggc result-panel">
        <div class="panel-heading">
          <div>
            <p class="section-kicker">计算结果</p>
            <h2>点数结算</h2>
          </div>
          <span class="result-state" :class="{ ready: isTrueAgari }">
            {{ isTrueAgari ? '已识别' : '等待完整牌型' }}
          </span>
        </div>

        <div v-if="isTrueAgari" class="result-content">
          <div class="number">
            <div v-if="result.pointType==2">{{result.point1}} / {{result.point2}}</div>
            <div v-else-if="result.pointType==0">{{result.point1}} ALL</div>
            <div v-else>{{result.point1}}</div>
          </div>
          <div class="result-summary">
            <span v-if="!result.isYakuman">{{result.han}}翻 <span v-if="needFu">{{result.fu}}符</span> {{manName}}</span>
            <span v-else>{{result.han}}倍役满</span>
          </div>
          <div class="result-columns">
            <div>
              <span class="result-label">成立役种</span>
              <ul>
                <li v-for="(name,index) in result.yaku" :key="index">{{name}}</li>
              </ul>
            </div>
            <div v-if="needFu">
              <span class="result-label">符计算内容</span>
              <ul>
                <li v-for="(name,index) in result.fuMessages" :key="index">{{name}}</li>
              </ul>
            </div>
          </div>
        </div>
        <div v-else class="empty-result">
          <span class="empty-result-icon">＋</span>
          <strong>无役 / 无和牌型</strong>
          <span>补齐 14 张手牌后计算结果会显示在这里。</span>
        </div>
      </section>
    </section>

    <div v-if="draggingPai" class="drag-layer" aria-hidden="true">
      <div class="drag-ghost" :style="{ transform: dragGhostTransform }">
        <img :src="tileSrc(draggingPai)" alt="" draggable="false" />
      </div>
    </div>
  </main>
</template>

<script>
import PaiSelect from '../components/PaiSelect.vue'
import BlockSelect from '../components/BlockSelect.vue'
import { NButton, NSelect, NCheckboxGroup, NCheckbox, NInputNumber} from 'naive-ui'
import { next, getType, getNumber } from '@/store/util'
import { Calculator } from '@/store/calc'
import { Result} from '@/store/definition'
import { PositionType, Pai, Block, BlockType, RIICHI, DOUBLE_RIICHI, IPPATSU, HAITEI_RAOYUE, HOUTEI_RAOYUI, RINNSHANN_KAIHOU, CHANKAN, TENHOU, CHIIHOU, TSUMO, RON, State } from "@/store/types"

export default {
  name: 'App',
  components: {
    PaiSelect,
    BlockSelect,
    NButton,
    NSelect,
    NCheckboxGroup,
    NCheckbox, NInputNumber
  },
  props:{
    rule:Object
  },
  data() {
    return {
      paiName: [
        ['1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p'],
        ['1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s'],
        ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m'],
        ['1z', '2z', '3z', '4z', '5z', '6z', '7z']
      ],
      optionMode:[
        {label:"手牌", value:"pai"},
        {label:"吃", value:"chi"},
        {label:"碰", value:"pon"},
        {label:"杠", value:"kan"},
        {label:"暗杠", value:"ankan"},
        {label:"拔北", value:"nuki"},
        {label:"宝牌指示牌", value:"dora"},
        {label:"里宝牌指示牌", value:"ura"},
      ],
      optionAgariWay:[
        {label:"自摸", value:"tsumo"},
        {label:"荣和", value:"ron"},
      ],
      optionWind:[
        {label:"东", value:"east"},
        {label:"南", value:"south"},
        {label:"西", value:"west"},
        {label:"北", value:"north"},
      ],
      yakuName:[
        {value:"riichi", name:"立直"},
        {value:"double-riichi", name:"双立直"},
        {value:"ippatsu", name:"一发"},
        {value:"haite", name:"海底捞月"},
        {value:"houte", name:"河底摸鱼"},
        {value:"rinnshann", name:"岭上开花"},
        {value:"chankan", name:"抢杠"},
        {value:"tenhou", name:"天和"},
        {value:"chiihou", name:"地和"},
      ],
      hand:[],
      furo:[],
      dora:[],
      ura:[],
      nuki:[],
      yakus:[],
      mode:"pai",
      agariWay:"tsumo",
      field:"east",
      seat:"east",
      red:0,
      ponba:0,
      result:new Result(),
      draggingPai:null,
      dragPoint:{x:0,y:0},
      dragOffset:{x:0,y:0},
      dropTarget:null,
    }
  },
  methods:{
    add(name){
      if(!this.isDisable[name]){
        if(this.mode=='pai')this.addSingle(this.hand,name);
        else if(this.mode=='dora')this.addSingle(this.dora,name);
        else if(this.mode=='ura')this.addSingle(this.ura,name);
        else if(this.mode=='nuki')this.addSingle(this.nuki,name);
        else this.addMulti(name);
      }
    },
    addSingle(obj, name){
      obj.push(name)
    },
    addMulti(na){
      this.furo.push({type:this.mode,name:na});
    },
    removeSingle(obj, name){
      const index = obj.findIndex((x)=>{return x==name})
      if(index >= 0) obj.splice(index,1)
    },
    removeMulti(index){
      if(index >= 0) this.furo.splice(index,1)
    },
    clearAll(){
      this.hand=[],
      this.furo=[],
      this.dora=[],
      this.ura=[],
      this.nuki=[],
      this.yakus=[],
      this.mode='pai',
      this.agariWay='tsumo',
      this.field='east',
      this.seat='east',
      this.red=0,
      this.ponba=0,
      this.result=new Result()
    },
    tileSrc(name){
      return require("../assets/"+name+".webp")
    },
    dropZoneClass(target){
      return {
        'is-drop-zone': Boolean(this.draggingPai),
        'is-drag-over': this.dropTarget === target,
      }
    },
    updateDropTarget(point){
      if(!this.draggingPai || typeof document === 'undefined') return

      const element = document.elementFromPoint(point.x, point.y)
      const target = element && element.closest
        ? element.closest('[data-drop-target]')
        : null
      this.dropTarget = target ? target.dataset.dropTarget : null
    },
    nativeDragOver(target){
      if(this.draggingPai) this.dropTarget = target
    },
    nativeDrop(target){
      if(this.draggingPai && this.canDropTo(target,this.draggingPai)) {
        this.addToDropTarget(target,this.draggingPai)
      }
      this.cancelTileDrag()
    },
    beginTileDrag(payload){
      if(!payload || !payload.name) return
      this.draggingPai = payload.name
      this.dragPoint = payload.point
      this.dragOffset = payload.offset
      this.dropTarget = null
      this.updateDropTarget(payload.point)
    },
    moveTileDrag(payload){
      if(!this.draggingPai || !payload) return
      this.dragPoint = payload.point
      this.updateDropTarget(payload.point)
    },
    endTileDrag(payload){
      if(!this.draggingPai) return
      if(payload) {
        this.dragPoint = payload.point
        this.updateDropTarget(payload.point)
      }

      const target = this.dropTarget
      const name = this.draggingPai
      if(target && this.canDropTo(target,name)) {
        this.addToDropTarget(target,name)
      }
      this.cancelTileDrag()
    },
    cancelTileDrag(){
      this.draggingPai = null
      this.dropTarget = null
      this.dragPoint = {x:0,y:0}
      this.dragOffset = {x:0,y:0}
    },
    tileKey(name){
      if(name && name[0] === '0') return '5'+name[1]
      return name
    },
    tileCount(name){
      const key = this.tileKey(name)
      let count = 0
      const countList = (list) => {
        for(const item of list) {
          if(this.tileKey(item) === key) count++
        }
      }
      countList(this.hand)
      countList(this.dora)
      countList(this.ura)
      countList(this.nuki)

      for(const block of this.furo) {
        if(block.type === 'chi') {
          if(this.tileKey(block.name) === key) count++
          if(this.tileKey(next(block.name)) === key) count++
          if(this.tileKey(next(next(block.name))) === key) count++
        }
        else if(this.tileKey(block.name) === key) {
          count += block.type === 'pon' ? 3 : 4
        }
      }
      return count
    },
    canDropTo(target,name){
      if(this.tileCount(name) >= 4) return false
      if(target === 'hand') return this.hand.length + this.furo.length * 3 < 14
      if(target === 'dora') return this.dora.length < 5
      if(target === 'ura') return this.ura.length < 5
      if(target === 'nuki') return name === '4z' && this.nuki.length < 4
      return false
    },
    addToDropTarget(target,name){
      if(target === 'hand') this.hand.push(name)
      else if(target === 'dora') this.dora.push(name)
      else if(target === 'ura') this.ura.push(name)
      else if(target === 'nuki') this.nuki.push(name)
    },
    myCalculate(){
      function cvtWind(x){
        if(x=='east')return PositionType.EAST;
        if(x=='west')return PositionType.WEST;
        if(x=='south')return PositionType.SOUTH;
        if(x=='north')return PositionType.NORTH;
      }
      function cvtPai(s){
        return new Pai(getType(s),getNumber(s))
      }
      function cvtFuro(s){
        let open = true
        let localType=BlockType.TRI
        if(s.type=="ankan")open=false

        if(s.type=="chi")localType = BlockType.SEQ
        else if(s.type=="pon")localType = BlockType.TRI
        else localType = BlockType.QUAD
        return new Block(localType,getType(s.name),getNumber(s.name),open)
      }
      function cvtYaku(x){
        if(x=="riichi")return RIICHI
        if(x=="double-riichi")return DOUBLE_RIICHI
        if(x=="ippatsu")return IPPATSU
        if(x=="haite")return HAITEI_RAOYUE
        if(x=="houte")return HOUTEI_RAOYUI
        if(x=="rinnshann")return RINNSHANN_KAIHOU
        if(x=="chankan")return CHANKAN
        if(x=="tenhou")return TENHOU
        if(x=="chiihou")return CHIIHOU
      }
      const tAgariWay = this.agariWay=='tsumo'?TSUMO:RON;
      const tSeat = cvtWind(this.seat);
      const tField = cvtWind(this.field);

      let tPai = [];
      for(const p of this.hand)tPai.push(cvtPai(p));

      const tAgariPai = tPai[tPai.length-1]
      tPai.splice(tPai.length-1,1);

      let tDora=[]
      for(const p of this.dora)tDora.push(cvtPai(p));
      let tUra=[]
      for(const p of this.ura)tUra.push(cvtPai(p));
      let tNuki=[]
      for(const p of this.nuki)tNuki.push(cvtPai(p));

      let tBlock = [];
      for(const b of this.furo)tBlock.push(cvtFuro(b));

      let tYaku=[];
      for(const y of this.yakus)tYaku.push(cvtYaku(y));

      let s = new State(
        tField,tSeat,tYaku,tAgariWay,tPai,tBlock,tDora,tUra,tAgariPai,this.red,tNuki
      )

      let c = new Calculator()
      this.result = c.calculate(s,this.rule)

      if(this.agariWay=='tsumo'){
        this.result.point1 += 100*this.ponba;
        this.result.point2 += 100*this.ponba;
      }
      else{
        this.result.point1 += 300*this.ponba;
      }
    },
    updateYaku(name){
      this.yakus.splice(this.yakus.findIndex((x)=>{return x==name}),1)
    }
  },
  computed:{
    dropTargetLabel(){
      const labels = {
        hand:'加入手牌',
        dora:'加入宝牌指示牌',
        ura:'加入里宝牌指示牌',
        nuki:'加入拔北',
      }
      return labels[this.dropTarget] || '选择目标区域'
    },
    dragGhostTransform(){
      const x = this.dragPoint.x - this.dragOffset.x
      const y = this.dragPoint.y - this.dragOffset.y
      return `translate3d(${x}px, ${y}px, 0)`
    },
    isDisable(){
      let paiLeft = {
        "1p": 4, "2p": 4, "3p": 4, "4p": 4, "5p": 4, "6p": 4, "7p": 4, "8p": 4, "9p": 4,
        "1s": 4, "2s": 4, "3s": 4, "4s": 4, "5s": 4, "6s": 4, "7s": 4, "8s": 4, "9s": 4,
        "1m": 4, "2m": 4, "3m": 4, "4m": 4, "5m": 4, "6m": 4, "7m": 4, "8m": 4, "9m": 4,
        "1z": 4, "2z": 4, "3z": 4, "4z": 4, "5z": 4, "6z": 4, "7z": 4,
      }
      let rt = {
        "1p": false, "2p": false, "3p": false, "4p": false, "5p": false, "6p": false, "7p": false, "8p": false, "9p": false,
        "1s": false, "2s": false, "3s": false, "4s": false, "5s": false, "6s": false, "7s": false, "8s": false, "9s": false,
        "1m": false, "2m": false, "3m": false, "4m": false, "5m": false, "6m": false, "7m": false, "8m": false, "9m": false,
        "1z": false, "2z": false, "3z": false, "4z": false, "5z": false, "6z": false, "7z": false,
      }

      
      for(const p of this.hand){
        paiLeft[p]--;
      }
      for(const p of this.dora){
        paiLeft[p]--;
      }
      for(const p of this.ura){
        paiLeft[p]--;
      }
      for(const p of this.nuki){
        paiLeft[p]--;
      }
      for(const x of this.furo){
        if(x.type=='pon'){
          paiLeft[x.name]-=3;
        }
        else if(x.type=='chi'){
          paiLeft[x.name]--;
          paiLeft[next(x.name)]--;
          paiLeft[next(next(x.name))]--;
        }
        else{
          paiLeft[x.name]-=4;
        }
      }

      if(this.mode=="pai"){
        if(this.hand.length== (14-this.furo.length*3)){
          for(const name in rt){
            rt[name]=true
          }
          return rt
        }
        for(const name in rt){
          if(paiLeft[name]==0){
            rt[name]=true;
          }else{
            rt[name]=false
          }
        }
      }
      else if(this.mode == 'dora'){
        if(this.dora.length==5){
          for(const name in rt){
            rt[name]=true
          }
          return rt
        }
        for(const name in rt){
          if(paiLeft[name]==0){
            rt[name]=true
          }else{
            rt[name]=false
          }
        }
      }
      else if(this.mode == 'ura'){
        if(this.ura.length==5){
          for(const name in rt){
            rt[name]=true
          }
          return rt
        }
        for(const name in rt){
          if(paiLeft[name]==0){
            rt[name]=true
          }else{
            rt[name]=false
          }
        }
      }
      else if(this.mode == 'nuki'){
        for(const name in rt){
          rt[name] = name != '4z' || this.nuki.length==4 || paiLeft[name]<1
        }
      }
      else{
        if(this.furo.length== Math.floor((14-this.hand.length)/3)){
          for(const name in rt){
            rt[name]=true
          }
          return rt
        }
        if(this.mode=="chi"){
          for(const name in rt){
            if(getNumber(name)>7 || getType(name)=='z'){
              rt[name]=true
            }
            else{
              if(paiLeft[name]==0 ||
                paiLeft[next(name)]==0 ||
                paiLeft[next(next(name))]==0){
                rt[name]=true
              }else{
                rt[name]=false
              }
            }
          }
        }
        else if(this.mode=="pon"){
          for(const name in rt){
            if(paiLeft[name]<3){
              rt[name]=true
            }else{
              rt[name]=false
            }
          }
        }
        else{
          for(const name in rt){
            if(paiLeft[name]<4){
              rt[name]=true
            }else{
              rt[name]=false
            }
          }
        }
      }
      return rt;
    },
    isYakuDisable(){
      let stat = {}
      for(const obj of this.yakuName){
        stat[obj.value] = false
      }
      let isMenzen = true
      let haveFuro = false
      let haveKan = this.nuki.length > 0

      for(const b of this.furo){
        haveFuro=true
        if(b.type!='ankan'){
          isMenzen=false
        }
        if(b.type=='kan'||b.type=='ankan'){
          haveKan=true
        }
      }

      if(this.agariWay=='tsumo'){
        stat['chankan']=true
        stat['houte']=true
      }
      if(this.agariWay=='ron'){
        stat['rinnshann']=true
        stat['haite']=true
        stat['tenhou']=true
        stat['chiihou']=true
      }

      if(haveFuro){
        stat['tenhou']=true
        stat['chiihou']=true
      }

      if(!isMenzen){
        stat['riichi']=true
        stat['double-riichi']=true
        stat['ippatsu']=true;
      }

      if(!haveKan){
        stat['rinnshann']=true
      }

      if(this.yakus.includes('riichi')){
        stat['double-riichi']=true
      }
      else if(this.yakus.includes('double-riichi')){
        stat['riichi']=true
      }
      else{
        stat['ippatsu']=true
      }



      if(this.seat=='east'){
        stat['chiihou']=true
      }
      else{
        stat['tenhou']=true
      }

      for(const name in stat){
        if(stat[name]){
          if(this.yakus.includes(name)){
            this.updateYaku(name)
          }
        }
      }

      return stat
    },
    needFu(){
      if(this.result.manType==0)return true;
      if(this.result.manType>=2)return false;
      if(this.result.han==5)return false;
      return true;
    },
    manName(){
      if(this.result.manType==0)return ''
      if(this.result.manType==1)return '满贯'
      if(this.result.manType==2)return '跳满'
      if(this.result.manType==3)return '倍满'
      if(this.result.manType==4)return '三倍满'
      if(this.result.manType==5)return '累计役满'
      return ''
    },
    calculateEnable(){
      return this.hand.length+this.furo.length*3==14
    },
    isTrueAgari(){
      if(this.result.han==0)return 0;

      let hasExceptDora=false;
      for(const name of this.result.yaku){
        if(name.startsWith("宝牌"))continue;
        if(name.startsWith("里宝牌"))continue;
        if(name.startsWith("赤宝牌"))continue;
        if(name.startsWith("红宝牌"))continue;
        if(name.startsWith("拔北"))continue;
        hasExceptDora = true;
      }
      return hasExceptDora
    }
  }
}
</script>

<style scoped>
  .calculator-page {
    display: grid;
    gap: 0.75rem;
    grid-template-areas:
      "palette controls results"
      "collections collections collections";
    grid-template-columns: minmax(0, 1.55fr) minmax(17rem, 0.78fr) minmax(18rem, 0.9fr);
    min-width: 0;
  }

  .surface-panel {
    backdrop-filter: blur(1.25rem) saturate(145%);
    -webkit-backdrop-filter: blur(1.25rem) saturate(145%);
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.66), rgba(255, 255, 255, 0.42));
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    color: var(--text);
    min-width: 0;
    overflow: hidden;
    position: relative;
  }

  .palette-panel {
    grid-area: palette;
    padding: clamp(0.9rem, 1.7vw, 1.25rem);
  }

  .palette-panel::after {
    background: radial-gradient(circle, rgba(174, 219, 255, 0.32), transparent 68%);
    bottom: -10rem;
    content: "";
    height: 19rem;
    pointer-events: none;
    position: absolute;
    right: -7rem;
    width: 19rem;
  }

  .section-heading,
  .panel-heading,
  .collection-heading,
  .subsection-heading {
    align-items: flex-start;
    display: flex;
    justify-content: space-between;
  }

  .section-heading {
    gap: 1rem;
    position: relative;
    z-index: 1;
  }

  .section-kicker {
    color: var(--teal-strong);
    font-size: 0.7rem;
    font-weight: 750;
    letter-spacing: 0.14em;
    margin: 0 0 0.25rem;
    text-transform: uppercase;
  }

  h1,
  h2,
  p {
    margin-top: 0;
  }

  h1,
  h2 {
    color: var(--text);
    font-weight: 720;
    letter-spacing: -0.035em;
  }

  h1 {
    font-size: clamp(1.3rem, 2vw, 1.8rem);
    line-height: 1.1;
    margin-bottom: 0.38rem;
  }

  h2 {
    font-size: 1.1rem;
    line-height: 1.2;
    margin-bottom: 0;
  }

  .section-description {
    color: var(--muted);
    font-size: 0.78rem;
    margin-bottom: 0;
  }

  .gesture-note {
    align-items: center;
    background: rgba(255, 255, 255, 0.58);
    border: 1px solid rgba(255, 255, 255, 0.78);
    border-radius: 999px;
    color: var(--muted);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.76rem;
    gap: 0.45rem;
    margin-top: 0.2rem;
    padding: 0.46rem 0.72rem;
    transition:
      background-color 180ms ease,
      border-color 180ms ease,
      color 180ms ease;
  }

  .gesture-note.active {
    background: rgba(209, 244, 255, 0.78);
    border-color: rgba(25, 142, 176, 0.36);
    color: var(--teal-strong);
  }

  .gesture-dot {
    background: var(--teal);
    border-radius: 50%;
    box-shadow: 0 0 0 0.22rem rgba(25, 142, 176, 0.1);
    height: 0.4rem;
    width: 0.4rem;
  }

  .gesture-note.active .gesture-dot {
    background: var(--teal);
    box-shadow: 0 0 0 0.22rem rgba(25, 142, 176, 0.18);
  }

  .tile-palette {
    display: flex;
    flex-direction: column;
    gap: 0.32rem;
    margin: 0.7rem -0.25rem -0.2rem;
    overflow-x: auto;
    padding: 0.5rem 0.25rem 0.3rem;
    position: relative;
    scrollbar-color: rgba(157, 176, 200, 0.35) transparent;
    scrollbar-width: thin;
    z-index: 1;
  }

  .tile-row {
    display: flex;
    gap: 0.1rem;
    justify-content: center;
    min-width: max-content;
  }

  :deep(.tile-palette .tile-button) {
    --tile-height: 3.85rem;
  }

  .editor-grid {
    display: contents;
  }

  .control-panel,
  .result-panel {
    align-self: stretch;
    min-width: 0;
    padding: clamp(0.9rem, 1.4vw, 1.15rem);
  }

  .control-panel {
    background:
      radial-gradient(circle at 0% 0%, rgba(192, 237, 255, 0.26), transparent 12rem),
      linear-gradient(150deg, rgba(255, 255, 255, 0.72), rgba(239, 248, 252, 0.42));
    display: flex;
    flex-direction: column;
    grid-area: controls;
    isolation: isolate;
  }

  .result-panel {
    grid-area: results;
  }

  .control-heading {
    align-items: flex-start;
    display: flex;
    gap: 0.8rem;
    justify-content: space-between;
  }

  .control-caption {
    color: var(--muted);
    font-size: 0.72rem;
    margin: 0.26rem 0 0;
  }

  .control-status {
    align-items: center;
    background: rgba(255, 255, 255, 0.36);
    backdrop-filter: blur(0.7rem) saturate(145%);
    -webkit-backdrop-filter: blur(0.7rem) saturate(145%);
    border: 1px double rgba(255, 255, 255, 0.68);
    border-radius: 999px;
    box-shadow:
      inset 1px -1px 1px -1px rgba(255, 255, 255, 0.82),
      inset 0 0 2px rgba(15, 23, 42, 0.1),
      0 0.2rem 0.48rem rgba(44, 83, 113, 0.05);
    color: var(--muted);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.67rem;
    gap: 0.38rem;
    margin-top: 0.2rem;
    padding: 0.4rem 0.58rem;
    transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease;
  }

  .control-status-dot {
    background: currentColor;
    border-radius: 50%;
    box-shadow: 0 0 0 0.2rem rgba(100, 117, 139, 0.1);
    height: 0.38rem;
    width: 0.38rem;
  }

  .control-status.ready {
    background: rgba(220, 247, 232, 0.76);
    border-color: rgba(49, 141, 104, 0.24);
    color: var(--success);
  }

  .control-status.ready .control-status-dot {
    box-shadow: 0 0 0 0.2rem rgba(49, 141, 104, 0.12);
  }

  .panel-heading {
    align-items: center;
    gap: 1rem;
  }

  .panel-mark {
    color: rgba(100, 117, 139, 0.62);
    font-size: 0.72rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.1em;
  }

  .action-row {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: 1fr 1fr;
    margin-top: 0.95rem;
    padding-top: 0.75rem;
    position: relative;
  }

  .action-row::before {
    background: linear-gradient(90deg, transparent, rgba(82, 121, 153, 0.14), transparent);
    content: "";
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  :deep(.action-button) {
    backdrop-filter: blur(0.8rem) saturate(155%);
    -webkit-backdrop-filter: blur(0.8rem) saturate(155%);
    border-style: double;
    border-radius: 0.72rem;
    font-size: 0.84rem;
    font-weight: 700;
    min-height: 2.45rem;
    overflow: hidden;
    transition:
      background-color 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease,
      transform 120ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  :deep(.action-button .n-button__border) {
    border-color: rgba(255, 255, 255, 0.74) !important;
  }

  :deep(.action-button .n-button__state-border) {
    border-color: transparent !important;
    box-shadow: none !important;
  }

  :deep(.calculate-button.n-button) {
    background: rgba(255, 255, 255, 0.44);
    border-color: rgba(255, 255, 255, 0.72);
    box-shadow:
      inset 1.5px -1.5px 1px -1px rgba(255, 255, 255, 0.88),
      inset -1.5px 1.5px 1px -1px rgba(255, 255, 255, 0.68),
      0 0.35rem 0.8rem rgba(44, 83, 113, 0.07);
    color: var(--muted);
  }

  :deep(.calculate-button.n-button:hover) {
    background: rgba(255, 255, 255, 0.44);
    border-color: rgba(255, 255, 255, 0.72);
    box-shadow:
      inset 1.5px -1.5px 1px -1px rgba(255, 255, 255, 0.94),
      inset -1.5px 1.5px 1px -1px rgba(255, 255, 255, 0.78),
      0 0.55rem 1rem rgba(44, 83, 113, 0.09);
  }

  :deep(.calculate-button.n-button.n-button--disabled) {
    background: rgba(255, 255, 255, 0.44);
    color: var(--muted);
  }

  :deep(.clear-button.n-button) {
    background: rgba(255, 255, 255, 0.44);
    border-color: rgba(255, 255, 255, 0.72);
    box-shadow:
      inset 1.5px -1.5px 1px -1px rgba(255, 255, 255, 0.88),
      inset -1.5px 1.5px 1px -1px rgba(255, 255, 255, 0.68),
      0 0.35rem 0.8rem rgba(44, 83, 113, 0.07);
    color: var(--danger);
  }

  :deep(.clear-button.n-button:hover) {
    background: rgba(255, 255, 255, 0.44);
    border-color: rgba(255, 255, 255, 0.72);
    box-shadow:
      inset 1.5px -1.5px 1px -1px rgba(255, 255, 255, 0.88),
      inset -1.5px 1.5px 1px -1px rgba(255, 255, 255, 0.68),
      0 0.35rem 0.8rem rgba(44, 83, 113, 0.07);
  }

  :deep(.action-button.n-button:active) {
    transform: scale(0.97) translateY(0.03rem);
  }

  :deep(.action-button.n-button:focus-visible) {
    outline: 0.15rem solid rgba(25, 142, 176, 0.42);
    outline-offset: 0.14rem;
  }

  :deep(.n-button--disabled) {
    filter: saturate(0.45);
    opacity: 0.42;
  }

  .line {
    border-color: rgba(82, 121, 153, 0.13);
    margin: 0.85rem 0;
  }

  .control-section {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.54), rgba(226, 241, 248, 0.3));
    backdrop-filter: blur(0.95rem) saturate(155%);
    -webkit-backdrop-filter: blur(0.95rem) saturate(155%);
    border: 1px double rgba(255, 255, 255, 0.7);
    border-radius: 0.92rem;
    box-shadow:
      inset 1.5px -1.5px 1px -1px rgba(255, 255, 255, 0.82),
      inset -1.5px 1.5px 1px -1px rgba(255, 255, 255, 0.74),
      inset 0 0 3px rgba(15, 23, 42, 0.12),
      0 0.5rem 1.1rem rgba(44, 83, 113, 0.06);
    isolation: isolate;
    overflow: hidden;
    padding: 0.68rem 0.7rem 0.72rem;
    position: relative;
  }

  .control-section::before,
  .control-section::after {
    border-radius: inherit;
    content: "";
    pointer-events: none;
    position: absolute;
  }

  .control-section::before {
    border: 1px double rgba(48, 91, 117, 0.14);
    filter: blur(0.85rem);
    height: calc(100% - 1rem);
    left: 0.5rem;
    top: 35%;
    width: calc(100% - 1rem);
  }

  .control-section::after {
    background: linear-gradient(115deg, rgba(255, 255, 255, 0.24), transparent 34%, rgba(255, 255, 255, 0.12));
    inset: 0;
  }

  .control-section > * {
    position: relative;
    z-index: 1;
  }

  .field-section {
    margin-top: 0.82rem;
  }

  .control-section + .control-section {
    margin-top: 0.68rem;
  }

  .control-section-heading {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.58rem;
  }

  .control-section-heading > div {
    align-items: baseline;
    display: flex;
    gap: 0.45rem;
    min-width: 0;
  }

  .control-section-title {
    color: var(--text);
    font-size: 0.76rem;
    font-weight: 760;
    letter-spacing: -0.01em;
  }

  .control-section-note {
    color: var(--muted);
    font-size: 0.65rem;
  }

  .section-index {
    align-items: center;
    background: rgba(255, 255, 255, 0.34);
    backdrop-filter: blur(0.7rem) saturate(150%);
    -webkit-backdrop-filter: blur(0.7rem) saturate(150%);
    border: 1px double rgba(255, 255, 255, 0.72);
    border-radius: 0.45rem;
    box-shadow:
      inset 1px -1px 1px -1px rgba(255, 255, 255, 0.82),
      inset 0 0 2px rgba(15, 23, 42, 0.12),
      0 0.2rem 0.45rem rgba(44, 83, 113, 0.06);
    color: rgba(100, 117, 139, 0.72);
    display: inline-flex;
    font-size: 0.62rem;
    font-variant-numeric: tabular-nums;
    height: 1.32rem;
    justify-content: center;
    letter-spacing: 0.08em;
    width: 1.72rem;
  }

  .field-grid {
    display: grid;
    gap: 0.62rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .field-row {
    align-items: stretch;
    color: var(--muted);
    display: flex;
    flex-direction: column;
    font-size: 0.7rem;
    font-weight: 650;
    gap: 0.28rem;
  }

  :deep(.field-row .n-base-selection),
  :deep(.field-row .n-input-number),
  :deep(.field-row .n-input) {
    min-height: 2.3rem;
  }

  :deep(.field-row .n-base-selection .n-base-selection-label),
  :deep(.field-row .n-input-number .n-input) {
    background: rgba(255, 255, 255, 0.42);
    backdrop-filter: blur(0.7rem) saturate(145%);
    -webkit-backdrop-filter: blur(0.7rem) saturate(145%);
    border-color: rgba(255, 255, 255, 0.66);
    border-radius: 0.62rem;
    box-shadow:
      inset 1px -1px 1px -1px rgba(255, 255, 255, 0.84),
      inset 0 0 2px rgba(15, 23, 42, 0.1),
      0 0.22rem 0.5rem rgba(44, 83, 113, 0.04);
    transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 120ms ease;
  }

  :deep(.field-row .n-base-selection:hover .n-base-selection-label),
  :deep(.field-row .n-input-number:hover .n-input) {
    background: rgba(255, 255, 255, 0.7);
    border-color: rgba(25, 142, 176, 0.42);
    box-shadow:
      inset 1px -1px 1px -1px rgba(255, 255, 255, 0.92),
      inset 0 0 2px rgba(15, 23, 42, 0.1),
      0 0 0 0.14rem rgba(25, 142, 176, 0.08),
      0 0.35rem 0.7rem rgba(44, 83, 113, 0.07);
  }

  :deep(.field-row .n-base-selection:focus-within .n-base-selection-label),
  :deep(.field-row .n-input-number:focus-within .n-input) {
    border-color: rgba(25, 142, 176, 0.52);
    box-shadow:
      inset 1px -1px 1px -1px rgba(255, 255, 255, 0.94),
      inset 0 0 2px rgba(15, 23, 42, 0.1),
      0 0 0 0.16rem rgba(25, 142, 176, 0.11);
  }

  :deep(.field-row .n-base-selection__state-border) {
    border-color: transparent !important;
    box-shadow: none !important;
  }

  :deep(.field-row .n-base-selection__border) {
    border-color: transparent !important;
  }

  :deep(.field-row .n-base-selection-label) {
    color: var(--text);
  }

  :deep(.field-row .n-input__input-el) {
    color: var(--text);
  }

  .yaku-block {
    min-height: 0;
  }

  .muted-label,
  .collection-help {
    color: var(--muted);
    font-size: 0.7rem;
    font-weight: 500;
  }

  .yaku-list {
    display: grid;
    gap: 0.05rem 0.35rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  :deep(.yaku-list .n-checkbox) {
    align-items: center;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid transparent;
    border-radius: 0.52rem;
    min-height: 1.78rem;
    padding: 0.16rem 0.28rem;
    transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease, transform 120ms ease;
  }

  :deep(.yaku-list .n-checkbox:hover) {
    background: rgba(213, 242, 255, 0.42);
    border-color: rgba(255, 255, 255, 0.58);
  }

  :deep(.yaku-list .n-checkbox:active) {
    transform: scale(0.97);
  }

  :deep(.yaku-list .n-checkbox-box) {
    background: rgba(255, 255, 255, 0.38);
    border-color: rgba(255, 255, 255, 0.64);
    border-radius: 0.34rem;
    box-shadow:
      inset 1px -1px 1px -1px rgba(255, 255, 255, 0.84),
      inset 0 0 2px rgba(15, 23, 42, 0.1);
    transition: background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 120ms ease;
  }

  :deep(.yaku-list .n-checkbox--checked .n-checkbox-box) {
    background: linear-gradient(135deg, rgba(57, 175, 213, 0.88), rgba(37, 139, 194, 0.82));
    border-color: rgba(255, 255, 255, 0.74);
    box-shadow:
      inset 1.5px -1.5px 1px -1px rgba(255, 255, 255, 0.88),
      inset -1px 1px 1px -1px rgba(255, 255, 255, 0.56),
      0 0.25rem 0.65rem rgba(41, 135, 187, 0.16);
  }

  :deep(.yaku-list .n-checkbox--checked .n-checkbox__label) {
    color: var(--teal-strong);
    font-weight: 680;
  }

  :deep(.yaku-list .n-checkbox__label) {
    color: var(--muted);
    font-size: 0.66rem;
    font-weight: 600;
    line-height: 1.25;
    white-space: nowrap;
  }

  :deep(.yaku-list .n-checkbox--disabled) {
    opacity: 0.42;
  }

  .result-panel {
    background:
      radial-gradient(circle at 82% 10%, rgba(221, 214, 255, 0.52), transparent 13rem),
      linear-gradient(145deg, rgba(255, 255, 255, 0.76), rgba(247, 250, 255, 0.52));
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .result-state {
    background: rgba(255, 255, 255, 0.58);
    border: 1px solid rgba(82, 121, 153, 0.14);
    border-radius: 999px;
    color: var(--muted);
    font-size: 0.72rem;
    padding: 0.35rem 0.62rem;
  }

  .result-state.ready {
    background: rgba(216, 246, 231, 0.76);
    border-color: rgba(49, 141, 104, 0.3);
    color: var(--success);
  }

  .result-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    padding: 1rem 0.2rem 0.2rem;
  }

  .number {
    color: var(--text);
    font-size: clamp(2rem, 4.5vw, 3.6rem);
    font-variant-numeric: tabular-nums;
    font-weight: 750;
    letter-spacing: -0.07em;
    line-height: 1;
  }

  .result-summary {
    color: var(--teal-strong);
    font-size: 1rem;
    font-weight: 650;
    margin-top: 0.7rem;
  }

  .result-columns {
    border-top: 1px solid rgba(82, 121, 153, 0.14);
    display: grid;
    gap: 1.3rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 1.45rem;
    padding-top: 1rem;
  }

  .result-label {
    color: var(--muted);
    display: block;
    font-size: 0.7rem;
    letter-spacing: 0.04em;
    margin-bottom: 0.35rem;
  }

  .result-columns ul {
    color: var(--text);
    font-size: 0.76rem;
    line-height: 1.65;
    margin: 0;
    padding-left: 1rem;
  }

  .empty-result {
    align-items: center;
    color: var(--muted);
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.45rem;
    justify-content: center;
    text-align: center;
  }

  .empty-result strong {
    color: var(--text);
    font-size: 1.05rem;
  }

  .empty-result span:last-child {
    font-size: 0.8rem;
  }

  .empty-result-icon {
    align-items: center;
    border: 1px dashed rgba(25, 142, 176, 0.36);
    border-radius: 0.75rem;
    color: var(--teal-strong);
    display: inline-flex;
    font-size: 1.45rem;
    height: 3rem;
    justify-content: center;
    width: 3rem;
  }

  .collections-grid {
    grid-area: collections;
    display: grid;
    gap: 0.8rem;
    grid-template-columns: minmax(0, 2.15fr) minmax(0, 1fr) minmax(0, 1.08fr) minmax(0, 1.08fr) minmax(0, 0.9fr);
  }

  .collection-panel {
    min-width: 0;
    padding: 0.78rem;
  }

  .collection-heading {
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.58rem;
  }

  .collection-heading > div {
    align-items: baseline;
    display: flex;
    gap: 0.45rem;
    min-width: 0;
  }

  .collection-title {
    color: var(--text);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .collection-count {
    color: var(--teal-strong);
    font-size: 0.7rem;
    font-variant-numeric: tabular-nums;
  }

  .box {
    align-items: flex-start;
    background: rgba(255, 255, 255, 0.32);
    border: 1px dashed rgba(82, 121, 153, 0.24);
    border-radius: 0.72rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.08rem;
    min-height: 4.1rem;
    overflow-x: auto;
    padding: 0.42rem;
    position: relative;
    scrollbar-width: thin;
    transition:
      background-color 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease,
      transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  :deep(.box .tile-button) {
    --tile-height: 3.45rem;
  }

  .box.is-drop-zone {
    background: rgba(217, 247, 255, 0.26);
    border-color: rgba(25, 142, 176, 0.28);
  }

  .box.is-drag-over {
    background: rgba(198, 241, 255, 0.68);
    border-color: var(--teal);
    box-shadow: 0 0 0 0.18rem rgba(25, 142, 176, 0.12), 0 1rem 2rem rgba(14, 114, 126, 0.12);
    transform: translateY(-0.12rem);
  }

  .drop-placeholder {
    align-items: center;
    color: rgba(100, 117, 139, 0.78);
    display: flex;
    flex: 1 1 100%;
    font-size: 0.76rem;
    justify-content: center;
    min-height: 3.1rem;
    text-align: center;
  }

  .drag-layer {
    inset: 0;
    pointer-events: none;
    position: fixed;
    z-index: 20;
  }

  .drag-ghost {
    left: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    transform-origin: top left;
    will-change: transform;
  }

  .drag-ghost img {
    border-radius: 0.7rem;
    box-shadow: 0 1.2rem 2.8rem rgba(44, 83, 113, 0.22), 0 0 0 0.15rem rgba(25, 142, 176, 0.35);
    display: block;
    height: 6rem;
    opacity: 0.96;
    transform: rotate(2deg) scale(1.03);
    width: auto;
  }

  @media screen and (max-width: 1100px) {
    .calculator-page {
      grid-template-areas:
        "palette palette"
        "controls results"
        "collections collections";
      grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.95fr);
    }

    .collections-grid {
      grid-template-columns: minmax(0, 2fr) repeat(4, minmax(0, 1fr));
    }
  }

  @media screen and (max-width: 720px) {
    .calculator-page {
      grid-template-areas:
        "palette"
        "controls"
        "results"
        "collections";
      grid-template-columns: minmax(0, 1fr);
    }

    .section-heading {
      flex-direction: column;
    }

    .gesture-note {
      align-self: flex-start;
    }

    .result-panel {
      min-height: 18rem;
    }

    .collections-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media screen and (max-width: 540px) {
    .calculator-page {
      gap: 0.2rem;
    }

    .palette-panel,
    .control-panel,
    .result-panel,
    .collection-panel {
      border-radius: 0;
    }

    .palette-panel {
      background: transparent;
      border: 0;
      box-shadow: none;
      overflow: visible;
      padding: 0;
    }

    .palette-panel::after {
      display: none;
    }

    .section-heading {
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      height: 1px;
      overflow: hidden;
      position: absolute;
      white-space: nowrap;
      width: 1px;
    }

    .tile-palette {
      gap: 0;
      margin: 0;
      padding: 0.125rem 0 0;
      scrollbar-width: none;
    }

    .tile-palette::-webkit-scrollbar {
      display: none;
    }

    .tile-row {
      gap: 0;
      justify-content: flex-start;
    }

    :deep(.tile-palette .tile-button) {
      --tile-height: 3.5rem;
      padding: 0;
    }

    .control-panel {
      background: transparent;
      border: 0;
      box-shadow: none;
      column-gap: 0.25rem;
      display: grid;
      grid-template-columns: minmax(0, 2.35fr) minmax(6.5rem, 1fr);
      grid-template-rows: auto auto;
      overflow: visible;
      padding: 0.28rem 0.1rem 0;
    }

    .control-heading,
    .panel-heading {
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      height: 1px;
      overflow: hidden;
      position: absolute;
      white-space: nowrap;
      width: 1px;
    }

    .action-row {
      grid-column: 1;
      grid-row: 1;
      gap: 0.15rem;
      grid-template-columns: 1fr;
      margin-top: 0;
      padding-top: 0;
    }

    .action-row::before {
      display: none;
    }

    :deep(.action-button) {
      border-radius: 0.22rem;
      font-size: 0.8rem;
      min-height: 2.2rem;
    }

    .control-section {
      background: transparent;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border: 0;
      border-radius: 0;
      box-shadow: none;
      overflow: visible;
      padding: 0;
    }

    .control-section::before,
    .control-section::after {
      display: none;
    }

    .control-section-heading {
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      height: 1px;
      overflow: hidden;
      position: absolute;
      white-space: nowrap;
      width: 1px;
    }

    .field-section {
      grid-column: 1;
      grid-row: 2;
      margin-top: 0.18rem;
    }

    .control-section + .control-section {
      margin-top: 0;
    }

    .field-grid {
      gap: 0;
      grid-template-columns: 1fr;
    }

    .field-row {
      align-items: center;
      display: grid;
      font-size: 0.68rem;
      gap: 0.3rem;
      grid-template-columns: 3.45rem minmax(0, 1fr);
      min-height: 2.5rem;
    }

    :deep(.field-row .n-base-selection),
    :deep(.field-row .n-input-number),
    :deep(.field-row .n-input),
    :deep(.field-row .n-base-selection .n-base-selection-label),
    :deep(.field-row .n-input-number .n-input) {
      height: 2.35rem;
      min-height: 2.35rem;
    }

    :deep(.field-row .n-base-selection .n-base-selection-label),
    :deep(.field-row .n-input-number .n-input) {
      border-radius: 0.2rem;
      padding-inline: 0.5rem;
    }

    .yaku-block {
      align-self: start;
      grid-column: 2;
      grid-row: 1 / span 2;
      margin-top: 0;
    }

    .yaku-list {
      gap: 0;
      grid-template-columns: 1fr;
    }

    :deep(.yaku-list .n-checkbox) {
      background: transparent;
      border: 0;
      border-radius: 0;
      min-height: 1.7rem;
      padding: 0;
    }

    :deep(.yaku-list .n-checkbox__label) {
      font-size: 0.68rem;
      line-height: 1.1;
    }

    .result-panel {
      background: transparent;
      border: 0;
      box-shadow: none;
      min-height: 0;
      overflow: visible;
      padding: 0;
    }

    .empty-result {
      align-items: center;
      background: #ffffff;
      border: 2px solid #1f1f1f;
      color: #111111;
      flex: 0 0 auto;
      gap: 0;
      justify-content: center;
      min-height: 6rem;
      padding: 0.25rem 0.35rem;
      text-align: left;
    }

    .empty-result strong {
      color: #111111;
      font-size: clamp(2.1rem, 11vw, 2.65rem);
      font-weight: 500;
      letter-spacing: -0.08em;
      line-height: 1.1;
      white-space: nowrap;
      width: 100%;
    }

    .empty-result-icon,
    .empty-result span:last-child {
      display: none;
    }

    .collections-grid {
      column-gap: 0.3rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      row-gap: 0.45rem;
    }

    .collection-panel {
      background: transparent;
      border: 0;
      box-shadow: none;
      overflow: visible;
      padding: 0;
    }

    .collection-heading {
      gap: 0;
      margin-bottom: 0.12rem;
    }

    .collection-heading > div {
      display: block;
    }

    .collection-title {
      font-size: 0.72rem;
    }

    .collection-count,
    .collection-help {
      display: none;
    }

    .collection-nuki {
      grid-column: 2;
      grid-row: 2;
    }

    .collection-panel:nth-child(4) {
      grid-column: 1;
      grid-row: 3;
    }

    .box {
      background: transparent;
      border-radius: 0.16rem;
      min-height: 4.8rem;
      padding: 0.12rem;
    }

    .drop-placeholder {
      font-size: 0;
      min-height: 4.45rem;
    }

    :deep(.box .tile-button) {
      --tile-height: 2.7rem;
    }

    .field-grid {
      grid-template-columns: 1fr;
    }

    .result-columns {
      grid-template-columns: 1fr;
    }

    .result-columns {
      gap: 0.8rem;
    }

    :deep(.box .tile-button) {
      --tile-height: 3rem;
    }

    :deep(.tile-palette .tile-button) {
      --tile-height: 3.5rem;
    }

    .drag-ghost img {
      height: 3.35rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .box.is-drag-over {
      transform: none;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    .control-panel,
    .control-section,
    .section-index,
    .control-status,
    :deep(.action-button),
    :deep(.field-row .n-base-selection .n-base-selection-label),
    :deep(.field-row .n-input-number .n-input),
    :deep(.yaku-list .n-checkbox),
    :deep(.yaku-list .n-checkbox-box) {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }

    .control-panel {
      background: var(--surface-strong);
    }

    .control-section {
      background: var(--surface);
    }
  }
</style>
