const path=require('path');
const http=require('http');
const express=require('express');
const {Server}=require('socket.io');

const app=express();
const server=http.createServer(app);
const io=new Server(server);
app.use(express.static(path.join(__dirname,'public')));

const rooms=new Map();
const cfg=[
 {name:'Álgebra',colorName:'Mantua',start:0},
 {name:'Aritmética',colorName:'Riese',start:13},
 {name:'Geometría',colorName:'Venecia',start:26},
 {name:'Trigonometría',colorName:'Treviso',start:39}
];
const route=[[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]];
const starts=[0,13,26,39];
function code(){let c='';do{c=Math.random().toString(36).slice(2,8).toUpperCase()}while(rooms.has(c));return c}
function initialTokens(n){return Array.from({length:n*4},(_,i)=>({p:Math.floor(i/4),n:i%4,pos:-1}))}
function spot(t){const p=cfg[t.p];const homes=[[[2,2],[2,4],[4,2],[4,4]],[[2,10],[2,12],[4,10],[4,12]],[[10,10],[10,12],[12,10],[12,12]],[[10,2],[10,4],[12,2],[12,4]]];const lanes=[[[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],[[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],[[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],[[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]]];if(t.pos<0)return homes[t.p][t.n];if(t.pos<52)return route[(p.start+t.pos)%52];if(t.pos<58)return lanes[t.p][t.pos-52];return [7,7]}
function legal(room,t){if(room.value===null||room.current!==t.p||t.pos>=58)return false;if(t.pos<0)return room.value===6;return t.pos+room.value<=58}
function publicState(room,message){return {code:room.code,playerCount:room.playerCount,current:room.current,value:room.value,started:room.started,awaitingMove:room.awaitingMove,tokens:room.tokens,message:message||'',winner:room.winner};}
function broadcast(room,message){io.to(room.code).emit('state',publicState(room,message));io.to(room.code).emit('roomInfo',{code:room.code,playerCount:room.playerCount,started:room.started,host:room.host,players:room.players.map(p=>({id:p.id,team:p.team,name:p.name}))})}
function playersReady(room){return room.players.length===room.playerCount}
function findQuestion(room,t){const skill=t.pos===58;const cell=skill?null:(cfg[t.p].start+t.pos)%52;const course=skill?null:Math.floor(cell/13);const bank=skill?(room.questions.skillQuestions||[]):((room.questions.customCellQuestions||{})[`${course}-${cell}`]||defaultQuestions(course,cell));if(!bank.length)return null;const key=skill?'skill':`${course}-${cell}`;if(!room.qQueues[key]||!room.qQueues[key].length)room.qQueues[key]=bank.map((_,i)=>i).sort(()=>Math.random()-.5);const item=bank[room.qQueues[key].pop()];return {id:Math.random().toString(36).slice(2),tag:skill?'Habilidad Matemática':`${cfg[course].colorName}: ${cfg[course].name}`,q:item.q,a:item.a,image:item.image||'',ok:item.ok};}
function defaultQuestions(course,cell){const n=cell+2;if(course===0)return[{q:`¿Cuánto vale x si x + ${n} = ${n+7}?`,a:[`${n+5}`,'7',`${n+7}`,`${n+9}`],ok:1},{q:`¿Cuánto vale x si 2x = ${2*n}?`,a:[`${n-1}`,`${n}`,`${n+1}`,`${2*n}`],ok:1},{q:`¿Cuánto vale x si x − ${n} = 5?`,a:['5',`${n}`,`${n+5}`,`${n+4}`],ok:2},{q:`Si x = ${n}, ¿cuánto es x + 3?`,a:[`${n+2}`,`${n+3}`,`${n+4}`,`${n*3}`],ok:1}];if(course===1){const f=2+(cell%8);return[{q:`¿Cuánto es ${f} × 7?`,a:[`${f*6}`,`${f*7}`,`${f*8}`,`${f+7}`],ok:1},{q:`¿Cuál es la mitad de ${2*n}?`,a:[`${n-1}`,`${n}`,`${n+1}`,`${2*n}`],ok:1},{q:`¿Cuánto es ${n+10} + ${n}?`,a:[`${2*n+8}`,`${2*n+10}`,`${2*n+12}`,`${n+10}`],ok:1},{q:`¿Cuánto es ${3*n} ÷ 3?`,a:[`${n-1}`,`${n}`,`${n+1}`,`${3*n}`],ok:1}]};if(course===2){const s=3+(cell%6);return[{q:`¿Cuántos lados tiene un polígono de ${s} lados?`,a:[`${s-1}`,`${s}`,`${s+1}`,'0'],ok:1},{q:'¿Cuánto suman los ángulos de un triángulo?',a:['90°','180°','270°','360°'],ok:1},{q:'Un cuadrado tiene lados…',a:['todos iguales','todos diferentes','curvos','ninguno'],ok:0},{q:'¿Cuántos vértices tiene un rectángulo?',a:['3','4','5','6'],ok:1}]};const a=[30,45,60,90],ang=a[cell%4];return[{q:`¿Cuál es el complemento de ${ang}°?`,a:[`${90-ang}°`,`${180-ang}°`,`${ang}°`,'360°'],ok:0},{q:'¿Cuánto vale cos(0°)?',a:['0','1','1/2','-1'],ok:1},{q:'¿Cuál de estos es un ángulo recto?',a:['45°','60°','90°','180°'],ok:2},{q:'¿Cuántos grados tiene una vuelta completa?',a:['180°','270°','360°','90°'],ok:2}]}
function capture(room,t){const at=spot(t);const absolute=(cfg[t.p].start+t.pos)%52;if(t.pos>=52||starts.includes(absolute))return;room.tokens.forEach(o=>{if(o!==t&&o.p!==t.p&&o.pos>=0&&o.pos<52){const os=spot(o);if(os[0]===at[0]&&os[1]===at[1])o.pos=-1}})}
function hasLegal(room){return room.tokens.some(t=>legal(room,t))}
function nextTurn(room){room.value=null;room.awaitingMove=false;room.current=(room.current+1)%room.playerCount;}

io.on('connection',socket=>{
 socket.on('createRoom',d=>{
  const n=Math.max(2,Math.min(4,Number(d.playerCount)||2));
  const c=code();const name=String(d.name||'Jugador').trim().replace(/\s+/g,' ').slice(0,24)||'Jugador';const room={code:c,host:socket.id,playerCount:n,players:[{id:socket.id,team:0,name}],started:false,current:0,value:null,awaitingMove:false,tokens:initialTokens(n),winner:null,questions:d.questions&&d.questions.questionMapVersion===2?d.questions:{customCellQuestions:{},skillQuestions:[]},qQueues:{},pending:null};
  rooms.set(c,room);socket.join(c);socket.data.room=c;socket.data.team=0;socket.emit('roomCreated',{code:c,team:0,playerCount:n});broadcast(room,'Sala creada. Esperando jugadores.');
 });
 socket.on('joinRoom',d=>{
  const c=String(d.code||'').toUpperCase();const room=rooms.get(c);if(!room){socket.emit('errorMessage','No existe esa sala.');return}if(room.started){socket.emit('errorMessage','La partida ya comenzó.');return}if(room.players.length>=room.playerCount){socket.emit('errorMessage','La sala está llena.');return}
  const used=new Set(room.players.map(p=>p.team));let team=0;while(used.has(team))team++;
  const name=String(d.name||'Jugador').trim().replace(/\s+/g,' ').slice(0,24)||'Jugador';if(room.players.some(p=>p.name.toLowerCase()===name.toLowerCase())){socket.emit('errorMessage','Ese nombre ya está ocupado en la sala.');return}room.players.push({id:socket.id,team,name});socket.join(c);socket.data.room=c;socket.data.team=team;socket.emit('joinedRoom',{code:c,team,playerCount:room.playerCount});broadcast(room,'Jugador conectado.');
 });
 socket.on('startGame',()=>{const room=rooms.get(socket.data.room);if(!room||room.host!==socket.id||room.started)return;if(!playersReady(room)){socket.emit('errorMessage',`Faltan ${room.playerCount-room.players.length} jugador(es).`);return}room.started=true;room.current=0;room.value=null;room.awaitingMove=false;room.tokens=initialTokens(room.playerCount);room.winner=null;room.pending=null;broadcast(room,`Partida iniciada. Empieza ${cfg[0].colorName}.`)});
 socket.on('rollDice',()=>{const room=rooms.get(socket.data.room);if(!room||!room.started||room.winner!==null)return;if(socket.data.team!==room.current||room.awaitingMove)return;room.value=1+Math.floor(Math.random()*6);room.awaitingMove=true;if(!hasLegal(room)){const v=room.value;nextTurn(room);broadcast(room,`Sacaste ${v}. No hay movimientos posibles. Turno de ${cfg[room.current].colorName}.`);return}broadcast(room,`Sacaste ${room.value}. ${cfg[room.current].colorName}, elige una ficha.`)});
 socket.on('moveToken',d=>{const room=rooms.get(socket.data.room);if(!room||!room.started||!room.awaitingMove||socket.data.team!==room.current)return;const t=room.tokens[Number(d.tokenIndex)];if(!t||t.p!==socket.data.team||!legal(room,t)){socket.emit('errorMessage','Movimiento no válido.');return}const old=t.pos;const six=room.value===6;t.pos=t.pos<0?0:t.pos+room.value;const white=t.pos>=0&&t.pos<52&&!starts.includes((cfg[t.p].start+t.pos)%52);if(white||t.pos===58){const q=findQuestion(room,t);if(q){room.pending={socketId:socket.id,tokenIndex:Number(d.tokenIndex),oldPos:old,six,questionId:q.id,question:q};socket.emit('question',{id:q.id,tag:q.tag,q:q.q,a:q.a,image:q.image||''});return}}
capture(room,t);finishMove(room,t,six,true);});
 socket.on('answerQuestion',d=>{const room=rooms.get(socket.data.room);const p=room&&room.pending;if(!room||!p||p.socketId!==socket.id||p.questionId!==d.questionId)return;const t=room.tokens[p.tokenIndex];const correct=Number(d.answer)===Number(p.question.ok);if(!correct)t.pos=p.oldPos;else capture(room,t);room.pending=null;finishMove(room,t,p.six,correct);socket.emit('questionResult',{message:correct?'Respuesta correcta.':'Respuesta incorrecta: vuelves a la casilla anterior.',state:publicState(room)});io.to(room.code).except(socket.id).emit('state',publicState(room,correct?'Respuesta respondida.':'Respuesta incorrecta.'));});
 socket.on('disconnect',()=>{const c=socket.data.room;const room=rooms.get(c);if(!room)return;if(room.started){socket.to(c).emit('message','Un jugador se desconectó. La sala se mantiene activa.');return}room.players=room.players.filter(p=>p.id!==socket.id);if(room.host===socket.id)room.host=room.players[0]?.id||null;if(!room.players.length)rooms.delete(c);else broadcast(room,'Un jugador salió de la sala.');});
});
function finishMove(room,t,six,correct){room.value=null;room.awaitingMove=false;if(t.pos===58&&correct){room.winner=t.p;broadcast(room,`¡${cfg[t.p].colorName} ganó la partida!`);return}if(!six||!correct)room.current=(room.current+1)%room.playerCount;broadcast(room,six&&correct?`Sacaste 6: vuelves a lanzar.`:`Turno de ${cfg[room.current].colorName}.`)}

const PORT=process.env.PORT||3000;
server.listen(PORT,'0.0.0.0',()=>console.log(`Ludo Matemático en http://localhost:${PORT}`));
