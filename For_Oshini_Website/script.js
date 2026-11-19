const hearts = document.getElementById("hearts");
function makeHeart(x = Math.random() * 100, size = 12 + Math.random() * 17) {
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = Math.random() > .35 ? "♥" : "♡";
  heart.style.left = x + "vw";
  heart.style.fontSize = size + "px";
  heart.style.animationDuration = (6 + Math.random() * 6) + "s";
  hearts.appendChild(heart);
  setTimeout(() => heart.remove(), 12500);
}
setInterval(() => makeHeart(), 850);

const modal = document.getElementById("modal");
function openModal(){ modal.classList.add("show"); modal.setAttribute("aria-hidden","false"); burstHearts(18); }
function closeModal(){ modal.classList.remove("show"); modal.setAttribute("aria-hidden","true"); }
function burstHearts(count=12){
  for(let i=0;i<count;i++) setTimeout(()=>makeHeart(20+Math.random()*60,16+Math.random()*22),i*65);
}
document.getElementById("surpriseBtn").addEventListener("click",openModal);
document.getElementById("closeModal").addEventListener("click",closeModal);
modal.addEventListener("click",e=>{if(e.target===modal)closeModal();});
document.getElementById("heartBtn").addEventListener("click",()=>burstHearts(30));
document.getElementById("modalHeartBtn").addEventListener("click",()=>{burstHearts(35);closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});

// Heart Catcher mini-game
let score=0, timeLeft=15, gameTimer=null, spawnTimer=null, playing=false;
const area=document.getElementById("playArea");
const scoreEl=document.getElementById("score");
const timeEl=document.getElementById("time");
const result=document.getElementById("gameResult");
function spawnCatchHeart(){
  if(!playing)return;
  const b=document.createElement("button");
  b.className="catch-heart";b.type="button";b.textContent="💗";
  b.setAttribute("aria-label","Catch heart");
  b.style.left=Math.random()*80+"%";b.style.top=Math.random()*65+"%";
  b.addEventListener("click",()=>{if(!playing)return;score++;scoreEl.textContent=score;b.remove();});
  area.appendChild(b);
  setTimeout(()=>b.remove(),1100);
}
function endGame(){
  playing=false;clearInterval(gameTimer);clearInterval(spawnTimer);
  area.querySelectorAll(".catch-heart").forEach(el=>el.remove());
  document.getElementById("startGame").textContent="Play again";
  result.textContent=`You caught ${score} hearts! Sending them all to Oshini. ❤️`;
}
document.getElementById("startGame").addEventListener("click",()=>{
  if(playing)return;
  score=0;timeLeft=15;playing=true;scoreEl.textContent="0";timeEl.textContent="15";
  result.textContent="";document.getElementById("gameHint").style.display="none";
  document.getElementById("startGame").textContent="Playing…";
  spawnCatchHeart();spawnTimer=setInterval(spawnCatchHeart,550);
  gameTimer=setInterval(()=>{timeLeft--;timeEl.textContent=timeLeft;if(timeLeft<=0)endGame();},1000);
});

// Flower message reveal
document.querySelectorAll(".flower").forEach(btn=>btn.addEventListener("click",()=>{
  document.getElementById("flowerMessage").textContent=btn.dataset.message;
  burstHearts(5);
}));

// Simple memory matching game
const memoryGrid=document.getElementById("memoryGrid");
const memoryStatus=document.getElementById("memoryStatus");
const symbols=["💗","🌸","⭐"];
let deck=[], chosen=[], matched=0, lock=false;
function shuffleCards(){
  deck=[...symbols,...symbols].sort(()=>Math.random()-.5);
  chosen=[];matched=0;lock=false;
  memoryGrid.innerHTML="";
  deck.forEach((symbol,index)=>{
    const tile=document.createElement("button");
    tile.className="memory-tile";tile.type="button";tile.textContent="?";
    tile.setAttribute("aria-label","Hidden memory card");
    tile.dataset.symbol=symbol;tile.dataset.index=index;
    tile.addEventListener("click",()=>flipTile(tile));
    memoryGrid.appendChild(tile);
  });
  memoryStatus.textContent="Pairs found: 0 / 3";
}
function flipTile(tile){
  if(lock||tile.classList.contains("matched")||chosen.includes(tile))return;
  tile.textContent=tile.dataset.symbol;chosen.push(tile);
  if(chosen.length===2){
    if(chosen[0].dataset.symbol===chosen[1].dataset.symbol){
      chosen.forEach(card=>card.classList.add("matched"));
      chosen=[];matched++;memoryStatus.textContent=`Pairs found: ${matched} / 3`;
      if(matched===3){memoryStatus.textContent="You found every pair! Well played, Oshini! 💖";burstHearts(12);}
    }else{
      lock=true;setTimeout(()=>{chosen.forEach(card=>card.textContent="?");chosen=[];lock=false;},750);
    }
  }
}
document.getElementById("resetMemory").addEventListener("click",shuffleCards);
shuffleCards();

// Original soft background melody made with Web Audio (no external music file).
let audioContext = null;
let musicTimer = null;
let musicStep = 0;
let musicPlaying = false;
const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 783.99, 698.46];
function playSoftNote(frequency, startTime, duration = 0.8) {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, startTime);
  filter.type = "lowpass";
  filter.frequency.value = 1400;
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.045, startTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(filter); filter.connect(gain); gain.connect(audioContext.destination);
  osc.start(startTime); osc.stop(startTime + duration + 0.03);
}
function scheduleMelody() {
  if (!musicPlaying || !audioContext) return;
  const now = audioContext.currentTime;
  const note = melody[musicStep % melody.length];
  playSoftNote(note, now, 0.95);
  if (musicStep % 4 === 0) playSoftNote(note / 2, now, 1.25);
  musicStep++;
}
async function toggleMusic() {
  const button = document.getElementById("musicToggle");
  const label = document.getElementById("musicLabel");
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      label.textContent = "Audio unavailable";
      return;
    }
    audioContext = new AudioContextClass();
  }
  if (musicPlaying) {
    musicPlaying = false;
    clearInterval(musicTimer);
    await audioContext.suspend();
    button.classList.remove("playing");
    button.setAttribute("aria-pressed", "false");
    label.textContent = "Play music";
  } else {
    await audioContext.resume();
    musicPlaying = true;
    scheduleMelody();
    musicTimer = setInterval(scheduleMelody, 850);
    button.classList.add("playing");
    button.setAttribute("aria-pressed", "true");
    label.textContent = "Pause music";
  }
}
document.getElementById("musicToggle").addEventListener("click", toggleMusic);

// A playful little quiz about the page.
const quizQuestions = [
  {q:"Who made this little website for you?", options:["A friendly unicorn 🦄","Kithsara ❤️","A sleepy panda 🐼"], correct:1, good:"You got it! Kithsara made this just for you. 💗"},
  {q:"What can you catch in the mini-game?", options:["Little hearts 💗","Flying pizzas 🍕","Tiny planets 🪐"], correct:0, good:"That's right! Sending you a whole sky full of hearts. 💕"},
  {q:"What's the sweetest thing to remember?", options:["You are appreciated 🌷","You must win every game","The flowers are made of cheese 🧀"], correct:0, good:"Exactly. Never forget how special you are, Oshini. ❤️"}
];
let quizIndex = 0;
function showQuizQuestion() {
  const item = quizQuestions[quizIndex];
  document.getElementById("quizQuestion").textContent = item.q;
  document.getElementById("quizFeedback").textContent = "Choose your answer, lovely!";
  const options = document.getElementById("quizOptions");
  options.innerHTML = "";
  item.options.forEach((label, index) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.textContent = label;
    button.addEventListener("click", () => {
      options.querySelectorAll("button").forEach((b, i) => {
        b.disabled = true;
        if (i === item.correct) b.classList.add("correct-answer");
      });
      if (index === item.correct) {
        document.getElementById("quizFeedback").textContent = item.good;
        burstHearts(7);
      } else {
        button.classList.add("wrong-answer");
        document.getElementById("quizFeedback").textContent = "Not quite! The right answer is highlighted. Try the next one. 💗";
      }
    });
    options.appendChild(button);
  });
}
document.getElementById("nextQuestion").addEventListener("click", () => {
  quizIndex = (quizIndex + 1) % quizQuestions.length;
  showQuizQuestion();
});
showQuizQuestion();
