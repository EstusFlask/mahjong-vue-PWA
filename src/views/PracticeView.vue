<template>
  <main v-if="this.problem!=null" class="practice-page">
    <section class="surface-panel practice-header">
      <div>
        <p class="section-kicker">点数练习</p>
        <h1>把直觉练成答案</h1>
        <p>观察牌面与场况，输入你认为正确的点数。</p>
      </div>
      <div class="practice-step">
        <span class="practice-step-dot"></span>
        {{ hintText === '输入答案' ? '第 1 步 · 计算' : '第 2 步 · 对照结果' }}
      </div>
    </section>

    <section class="surface-panel hand-stage">
      <div class="stage-heading">
        <div>
          <span class="stage-label">题面</span>
          <strong>当前手牌</strong>
        </div>
        <span class="stage-hint">和了牌以分隔线标记</span>
      </div>
      <div class="hand-line">
        <pai-select v-for="(name,index) in hand" :key="index" :name="name"/>
        <span class="tile-spacer"></span>
        <pai-select :name="agariPai"/>
        <span class="tile-spacer"></span>
        <block-select v-for="(obj,index) in furo" :key="index"
          :type="obj.type" :name="obj.name" :red="obj.cnt"/>
      </div>
    </section>

    <section class="practice-grid">
      <div class="surface-panel context-panel">
        <div class="panel-heading">
          <div>
            <p class="section-kicker">场况</p>
            <h2>这局发生了什么</h2>
          </div>
          <span class="panel-mark">INFO</span>
        </div>

        <div class="indicator-group">
          <div class="indicator-row">
            <span class="indicator-label">表</span>
            <div class="indicator-tiles">
              <pai-select v-for="(name,index) in dora" :key="index" :name="name"/>
            </div>
          </div>
          <div class="indicator-row">
            <span class="indicator-label">里</span>
            <div class="indicator-tiles">
              <pai-select v-for="(name,index) in ura" :key="index" :name="name"/>
            </div>
          </div>
        </div>

        <div class="situation-copy">和了情况</div>
        <n-input class="situation-input" size="large"
          v-model:value="info" readonly :rows="6"
          type="textarea"
        />
      </div>

      <div class="surface-panel answer-panel">
        <div class="panel-heading">
          <div>
            <p class="section-kicker">你的答案</p>
            <h2>{{hintText}}</h2>
          </div>
          <span class="answer-key">ENTER</span>
        </div>

        <n-input ref="input" v-if="hintText=='输入答案'" size="large" class="answer-input"
          v-model:value="ans"
          type="textarea"
          :allow-input="(value) => !value || /^[\d ]+$/.test(value)"
          :placeholder="placeHolder"
        />
        <div v-else class="answer-result" id="ans-div">
          <div class="result-yaku">
            <span class="result-label">成立役种</span>
            <ul>
              <li v-for="name in yaku" :key="name">{{name}}</li>
            </ul>
          </div>
          <div v-if="result.includes('符')" class="result-fu">
            <span class="result-label">符计算内容</span>
            <ul>
              <li v-for="name in this.problem.ans.fuMessages" :key="name">{{name}}</li>
            </ul>
          </div>
          <div class="answer-points">{{result}}</div>
          <div class="answer-line">{{user[0]}}</div>
          <div class="answer-line">{{user[1]}}</div>
          <div v-if="user[2]" class="correct answer-feedback">答案正确</div>
          <div v-else class="wrong answer-feedback">答案错误</div>
        </div>
        <n-button class="pressable practice-action" @click="onClick()" size="large">{{btnText}}</n-button>
      </div>
    </section>
  </main>
</template>

<script>
  import PaiSelect from '@/components/PaiSelect.vue'
  import BlockSelect from '@/components/BlockSelect.vue'
  import { NInput, NButton } from 'naive-ui'

  import {ProblemGenerator} from '@/store/problem'
import { CHIIHOU, HOUTEI_RAOYUI, FIELD_WEST, DOUBLE_RIICHI, CHANKAN, HAITEI_RAOYUE, RIICHI, SEAT_NORTH, SEAT_WEST, RON, RINNSHANN_KAIHOU, TENHOU, FIELD_SOUTH, SEAT_EAST, IPPATSU, TSUMO, FIELD_NORTH, FIELD_EAST, SEAT_SOUTH } from "@/store/types"
  import {test} from '@/store/util'

  export default{
    name:"PracticeView",
    data(){
      return {
        generator : new ProblemGenerator(this.rule),
        problem:new ProblemGenerator(this.rule).generate() ,
        info: '',
        ans: '',
        hintText:'输入答案',
        btnText:"确认",
      }
    },
    props:{
      rule: Object
    },
    components:{
      PaiSelect,BlockSelect,NInput,NButton
    },
    created(){
      this.newProblem()
    },
    mounted() {
      //  监听键盘事件
      document.addEventListener('keydown', this.handleKeyDown.bind(null, this));
      this.$refs.input.focus()
    },
    methods:{
      cvtPai(pai){
        let num = pai.num
        let tp = pai.type
        if(pai.redCnt==1)num =0 
        return num+tp
      },
      cvtFuro(b){
        let tp=""
        if(b.bType==0)tp="chi"
        else if(b.bType==1)tp='pon'
        else if(b.bType==2 && b.isOpen)tp='kan'
        else tp='ankan'

        let num = b.num
        let ptp = b.pType

        return {
          type:tp,name:num+ptp,cnt:b.redCnt
        }
      },
      newProblem(){
        // console.log("new problem",this.problem.flag)
        function testFlag(this_,flag,name){
          if(test(this_.problem.flag,flag)){
            this_.info+=name;
          }
        }
        let roundNumber = "一"
        testFlag(this,FIELD_EAST, "东" + roundNumber + "局 ");
        testFlag(this,FIELD_SOUTH, "南" + roundNumber + "局 ");
        testFlag(this,FIELD_WEST, "西" + roundNumber + "局 ");
        testFlag(this,FIELD_NORTH, "北" + roundNumber + "局 ");
        testFlag(this,SEAT_EAST, "东家 ");
        testFlag(this,SEAT_SOUTH, "南家 ");
        testFlag(this,SEAT_WEST, "西家 ");
        testFlag(this,SEAT_NORTH, "北家 ");
        testFlag(this,TSUMO, "自摸\n");
        testFlag(this,RON, "荣和\n");
        testFlag(this,RIICHI, "立直\n");
        testFlag(this,DOUBLE_RIICHI, "双立直\n");
        testFlag(this,IPPATSU, "一发\n");
        testFlag(this,HAITEI_RAOYUE, "海底捞月\n");
        testFlag(this,HOUTEI_RAOYUI, "河底摸鱼\n");
        testFlag(this,RINNSHANN_KAIHOU, "岭上开花\n");
        testFlag(this,CHANKAN, "抢杠\n");
        testFlag(this,TENHOU, "天和\n");
        testFlag(this,CHIIHOU, "地和\n");
      },
      handleKeyDown: (vm, e) => {
        if(e.key == "Enter"){
            vm.onClick()
            e.preventDefault()
        }
      },
      onClick(){
          console.log(this)
        if(this.btnText=="确认"){
          this.hintText = "答案显示"
          this.btnText="下一题"
        }
        else{
          this.hintText = "输入答案"
          this.ansReadOnly = true
          this.btnText="确认"
          this.ans=""
          this.problem = this.generator.generate()
          this.info=""
          this.newProblem();
          this.$nextTick(()=>{this.$refs.input.focus()})
        }
      }
    },
    computed:{
      hand(){
        let rt=[]
        for(const x of this.problem.hand){
          if(!x.isAgari){
            rt.push(this.cvtPai(x))
          }
        }
        return rt
      },
      agariPai(){
        return this.cvtPai(this.problem.agariPai);
      },
      furo(){
        let rt=[]
        for(const x of this.problem.furu){
          rt.push(this.cvtFuro(x))
        }
        return rt
      },
      dora(){
        let rt=[]
        for(const x of this.problem.dora){
          rt.push(this.cvtPai(x))
        }
        while(rt.length<5){
          rt.push('B')
        }
        return rt
      },
      ura(){
        let rt=[]
        for(const x of this.problem.ura){
          rt.push(this.cvtPai(x))
        }
        while(rt.length<5){
          rt.push('B')
        }
        return rt
      },
      placeHolder(){
        let pt = this.problem.ans.pointType;
        if(pt==1||pt==3){
            return "荣和：请直接输入点数"
        }
        else if(pt==0){
            return "亲家自摸：请输入收取每人点数"
        }
        else{
            return "子家自摸：请按顺序输入收取子家/亲家点数,中间用空格隔开"
        }
      },
      yaku(){
        return this.problem.ans.yaku;
      },
      result(){
        const p = this.problem;

        if (p.ans.isYakuman) {
           return(parseInt(p.ans.han) + "倍役满");
        }
        else {
          switch (p.ans.manType) {
            case 0:
             return(
                parseInt(p.ans.han) + "翻 " +
                parseInt(p.ans.fu) + "符");
            case 1:
              if (p.ans.han != 5) {
               return(
                  parseInt(p.ans.han) + "翻 " +
                  parseInt(p.ans.fu) + "符 满贯");
              }
              else {
               return(
                    parseInt(p.ans.han) + "翻 满贯");
              }
            case 2:
               return(parseInt(p.ans.han) +
                                        "翻 跳满");
            case 3:
               return(parseInt(p.ans.han) +
                                        "翻 倍满");
            case 4:
               return(parseInt(p.ans.han) +
                                        "翻 三倍满");
            case 5:
               return(parseInt(p.ans.han) +
                                        "翻 累计役满");
          }
        }
        return "错误"
      },
      user(){
        const s = this.ans;
        let x1=0,x2=0

        const l = s.split(/[;: /]/)
        let lt=[]
        for(const b of l){
            if(b!='')lt.push(b)
        }

        x1 = +lt[0]
        if(lt.length>1)x2=+lt[1]

        let correct = true
        const p = this.problem;
        let rt=[]

        if(p.ans.pointType == 1 || p.ans.pointType==3){
          rt.push(`您输入的答案为: ${x1}\n`)
          rt.push(`正确答案: ${p.ans.point1}\n`)
          if(x1!=p.ans.point1)correct=false
        }
        else if(p.ans.pointType == 0){
          rt.push(`您输入的答案为: ${x1} ALL\n`)
          rt.push(`正确答案: ${p.ans.point1}ALL\n`)
          if(x1!=p.ans.point1)correct=false
        }
        else{
          rt.push(`您输入的答案为: ${x1}/${x2}\n`)
          rt.push(`正确答案: ${p.ans.point1}/${p.ans.point2}\n`)
          if(x1!=p.ans.point1 || x2!=p.ans.point2)correct=false
        }
        rt.push(correct)
        return rt
      }
    },
  }
</script>

<style>
  .practice-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
  }

  .practice-page .surface-panel {
    backdrop-filter: blur(1.25rem) saturate(145%);
    -webkit-backdrop-filter: blur(1.25rem) saturate(145%);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.66), rgba(255, 255, 255, 0.42));
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    color: var(--text);
    overflow: hidden;
    position: relative;
  }

  .practice-header {
    align-items: center;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    padding: clamp(1rem, 2.5vw, 1.7rem);
  }

  .practice-header h1 {
    color: var(--text);
    font-size: clamp(1.45rem, 3vw, 2.25rem);
    letter-spacing: -0.055em;
    line-height: 1.04;
    margin: 0 0 0.45rem;
  }

  .practice-header p:last-child {
    color: var(--muted);
    font-size: 0.88rem;
    margin: 0;
  }

  .section-kicker {
    color: var(--teal);
    font-size: 0.7rem;
    font-weight: 750;
    letter-spacing: 0.14em;
    margin: 0 0 0.28rem;
    text-transform: uppercase;
  }

  .practice-step {
    align-items: center;
    background: rgba(255, 255, 255, 0.58);
    border: 1px solid rgba(255, 255, 255, 0.78);
    border-radius: 999px;
    color: var(--muted);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.76rem;
    gap: 0.45rem;
    padding: 0.5rem 0.72rem;
  }

  .practice-step-dot {
    background: var(--teal);
    border-radius: 50%;
    box-shadow: 0 0 0 0.22rem rgba(25, 142, 176, 0.12);
    height: 0.4rem;
    width: 0.4rem;
  }

  .hand-stage {
    overflow: hidden;
    padding: 1rem clamp(1rem, 2.5vw, 1.7rem) 1.2rem;
  }

  .stage-heading {
    align-items: baseline;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    margin-bottom: 0.85rem;
  }

  .stage-heading > div {
    align-items: baseline;
    display: flex;
    gap: 0.55rem;
  }

  .stage-label,
  .result-label {
    color: var(--muted);
    font-size: 0.72rem;
  }

  .stage-heading strong {
    color: var(--text);
    font-size: 0.95rem;
  }

  .stage-hint {
    color: rgba(100, 117, 139, 0.76);
    font-size: 0.72rem;
  }

  .hand-line {
    align-items: flex-end;
    display: flex;
    gap: 0.08rem;
    min-width: max-content;
    overflow-x: auto;
    padding: 0.45rem 0.2rem 0.25rem;
    scrollbar-width: thin;
  }

  .hand-line .tile-spacer {
    border-left: 1px solid rgba(82, 121, 153, 0.22);
    height: 4.5rem;
    margin: 0 0.3rem;
  }

  .hand-line .tile-button {
    --tile-height: 4.85rem;
  }

  .practice-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: minmax(19rem, 0.9fr) minmax(0, 1.35fr);
  }

  .context-panel,
  .answer-panel {
    min-width: 0;
    padding: clamp(1rem, 2.2vw, 1.5rem);
  }

  .panel-heading {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }

  .panel-heading h2 {
    color: var(--text);
    font-size: 1.1rem;
    letter-spacing: -0.035em;
    margin: 0;
  }

  .panel-mark,
  .answer-key {
    color: rgba(100, 117, 139, 0.64);
    font-size: 0.68rem;
    letter-spacing: 0.1em;
  }

  .answer-key {
    border: 1px solid rgba(82, 121, 153, 0.18);
    border-radius: 0.45rem;
    padding: 0.25rem 0.42rem;
  }

  .indicator-group {
    border-bottom: 1px solid rgba(82, 121, 153, 0.13);
    margin: 1.25rem 0 1rem;
    padding-bottom: 1rem;
  }

  .indicator-row {
    align-items: center;
    display: grid;
    gap: 0.65rem;
    grid-template-columns: 1.1rem minmax(0, 1fr);
  }

  .indicator-row + .indicator-row {
    margin-top: 0.4rem;
  }

  .indicator-label {
    color: var(--muted);
    font-size: 0.78rem;
  }

  .indicator-tiles {
    display: flex;
    gap: 0.05rem;
    min-width: 0;
    overflow-x: auto;
  }

  .indicator-tiles .tile-button {
    --tile-height: 3.65rem;
  }

  .situation-copy {
    color: var(--muted);
    font-size: 0.76rem;
    margin-bottom: 0.45rem;
  }

  .situation-input,
  .answer-input {
    background: rgba(255, 255, 255, 0.58);
    border: 1px solid rgba(82, 121, 153, 0.16);
    border-radius: 0.75rem;
    color: var(--text);
  }

  .situation-input .n-input__textarea,
  .answer-input .n-input__textarea {
    color: var(--text);
    line-height: 1.65;
  }

  .situation-input .n-input__textarea::placeholder,
  .answer-input .n-input__textarea::placeholder {
    color: rgba(100, 117, 139, 0.62);
  }

  .answer-panel {
    display: flex;
    flex-direction: column;
    min-height: 25rem;
  }

  .answer-input {
    flex: 1;
    margin: 1.35rem 0 1rem;
    min-height: 12rem;
  }

  .answer-input .n-input__textarea {
    min-height: 10rem;
  }

  .answer-result {
    background: rgba(255, 255, 255, 0.36);
    border: 1px solid rgba(82, 121, 153, 0.14);
    border-radius: 0.8rem;
    flex: 1;
    margin: 1.35rem 0 1rem;
    min-height: 12rem;
    overflow: auto;
    padding: 0.95rem;
  }

  .answer-result ul {
    color: var(--text);
    font-size: 0.82rem;
    line-height: 1.62;
    margin: 0.35rem 0 0;
    padding-left: 1rem;
  }

  .result-fu {
    border-top: 1px solid rgba(82, 121, 153, 0.12);
    margin-top: 0.75rem;
    padding-top: 0.7rem;
  }

  .answer-points {
    color: var(--teal-strong);
    font-size: 1.45rem;
    font-weight: 750;
    letter-spacing: -0.04em;
    margin-top: 0.85rem;
  }

  .answer-line {
    color: var(--muted);
    font-size: 0.8rem;
    white-space: pre-line;
  }

  .answer-feedback {
    font-size: 1.28rem;
    font-weight: 750;
    margin-top: 0.65rem;
  }

  .correct {
    color: var(--success);
  }

  .wrong {
    color: var(--danger);
  }

  .practice-action {
    align-self: flex-end;
    border-radius: 0.8rem;
    font-size: 0.92rem;
    font-weight: 700;
    min-width: 7.5rem;
  }

  .practice-action.n-button {
    background: linear-gradient(135deg, #36a9d2, #2589c5);
    border-color: rgba(255, 255, 255, 0.7);
    box-shadow: 0 0.6rem 1.2rem rgba(41, 135, 187, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.42);
    color: #ffffff;
  }

  .practice-action.n-button:hover {
    background: linear-gradient(135deg, #4eb9df, #3198d2);
  }

  @media screen and (max-width: 800px) {
    .practice-grid {
      grid-template-columns: 1fr;
    }
  }

  @media screen and (max-width: 560px) {
    .practice-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .stage-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 0.25rem;
    }

    .hand-line .tile-button {
      --tile-height: 3.45rem;
    }

    .hand-line .tile-spacer {
      height: 3.25rem;
      margin-inline: 0.18rem;
    }

    .indicator-tiles .tile-button {
      --tile-height: 2.9rem;
    }
  }
</style>
