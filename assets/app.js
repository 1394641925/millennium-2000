/* 千禧倒计时站 · 公共脚本：访客计数 / 进度 / CRT 开关 / 8-bit 音效 */
(function(){
  var K='m2000_flags',V='m2000_visits',A='m2000_answer',L='m2000_line';
  var P={};try{P=JSON.parse(localStorage.getItem(K)||'{}')}catch(e){P={}}
  function save(){try{localStorage.setItem(K,JSON.stringify(P))}catch(e){}}
  window.M2000={
    flag:function(k){return !!P[k]},
    mark:function(k){P[k]=1;save()},
    get:function(){return P},
    visits:function(){
      var n=1;try{n=(parseInt(localStorage.getItem(V)||'44',10)||44)+1;localStorage.setItem(V,''+n)}catch(e){}
      return n;
    },
    setAnswer:function(s){try{localStorage.setItem(A,s)}catch(e){}},
    getAnswer:function(){try{return localStorage.getItem(A)||''}catch(e){return ''}},
    setLine:function(s){try{localStorage.setItem(L,s)}catch(e){}},
    getLine:function(){try{return localStorage.getItem(L)||''}catch(e){return ''}}
  };

  // 访客计数器（每个页面若存在 #visits）
  function paintVisits(){
    var el=document.getElementById('visits');if(!el)return;
    var n=window.M2000.visits();
    el.textContent=('000000'+n).slice(-6);
  }
  paintVisits();

  // CRT 扫描线开关
  var crtOn=true;try{crtOn=localStorage.getItem('m2000_crt')!=='0'}catch(e){}
  function applyCrt(){document.documentElement.classList.toggle('crt',crtOn)}
  applyCrt();
  document.addEventListener('click',function(e){
    var t=e.target;
    if(t&&t.id==='crtToggle'){
      crtOn=!crtOn;try{localStorage.setItem('m2000_crt',crtOn?'1':'0')}catch(e){}
      applyCrt();t.textContent=crtOn?'◎ 老显示器：开':'◎ 老显示器：关';
    }
    if(t&&t.id==='soundToggle'){toggleSound(t)}
  });

  // —— 8-bit 音效（Web Audio 合成，无需外部资源）——
  var actx=null,playing=false,timer=null,step=0;
  var MELODY=[ // 自定义千禧贺卡风格旋律（半音，0=静音）
    523,659,784,1047,784,659,523,0,
    587,784,988,1175,988,784,587,0,
    523,659,784,1047,988,784,880,784,
    659,784,880,1047,880,784,659,0
  ];
  function tone(f,dur,type,vol){
    if(!actx||!f)return;
    var o=actx.createOscillator(),g=actx.createGain();
    o.type=type||'square';o.frequency.value=f;
    var t=actx.currentTime;
    g.gain.setValueAtTime(vol||0.035,t);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+dur+0.02);
  }
  function tick(){
    var f=MELODY[step%MELODY.length];
    tone(f,0.22,'square',0.03);
    if(step%4===0)tone(f/2,0.24,'triangle',0.02);
    step++;
  }
  function toggleSound(btn){
    if(playing){
      clearInterval(timer);playing=false;btn.textContent='♪ 播放背景音乐';btn.setAttribute('aria-pressed','false');
      return;
    }
    try{
      var AC=window.AudioContext||window.webkitAudioContext;
      if(!AC){btn.textContent='♪ 浏览器不支持音频';return}
      if(!actx)actx=new AC();
      if(actx.state==='suspended')actx.resume();
      dialUp(); // 先来一段拨号音
      setTimeout(function(){playing=true;step=0;timer=setInterval(tick,230)},1100);
      btn.textContent='■ 停止音乐';btn.setAttribute('aria-pressed','true');
    }catch(e){btn.textContent='♪ 音频不可用'}
  }
  function dialUp(){
    if(!actx)return;
    var t=actx.currentTime;
    // 摘机音 350+440
    [350,440].forEach(function(f){var o=actx.createOscillator(),g=actx.createGain();
      o.frequency.value=f;g.gain.setValueAtTime(0.04,t);g.gain.exponentialRampToValueAtTime(.0001,t+0.5);
      o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+0.52)});
    // DTMF 扫频（模拟拨号）
    var freqs=[697,770,852,941,1209,1336,1477,1209,1336,1477];
    freqs.forEach(function(f,i){
      var o=actx.createOscillator(),g=actx.createGain(),s=t+0.55+i*0.09;
      o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0.025,s);g.gain.exponentialRampToValueAtTime(.0001,s+0.08);
      o.connect(g);g.connect(actx.destination);o.start(s);o.stop(s+0.09);
    });
    // 噪声握手
    var len=actx.sampleRate*0.5,buf=actx.createBuffer(1,len,actx.sampleRate),d=buf.getChannelData(0);
    for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*0.25;
    var src=actx.createBufferSource(),ng=actx.createGain();src.buffer=buf;
    ng.gain.setValueAtTime(0.03,t+1.05);ng.gain.exponentialRampToValueAtTime(.0001,t+1.5);
    src.connect(ng);ng.connect(actx.destination);src.start(t+1.05);
  }

  // 控制台彩蛋
  try{
    console.log('%c千禧倒计时站 · 1999','color:#000080;font-weight:bold;font-size:14px');
    console.log('%c倒计时为什么停在 00:00:01？因为还有一个人没到。','color:#c00');
  }catch(e){}
})();
