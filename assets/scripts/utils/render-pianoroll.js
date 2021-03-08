const ChannelColor = [
	"#f66", "#fa6", "#f6f", "#6f6",
	"#6af", "#66f", "#f22", "#fa2",
	"#f2f", "#666", "#2f2", "#2af",
	"#22f", "#a00", "#060", "#006",
	"#000", "#000", "#000", "#000",
	"#000", "#000", "#000", "#000"
];

function drawPianoRollBeats (data, canvas, tempCanvases, canvasRatio) {
  data.beatTrack.forEach((beat, idx)=> {
    let i = beat.timing;
    for (let cnt=0; ; cnt++) {
      // 拍子の切り替わりか曲の終わりで描画終了
      if (i >= (data.beatTrack[idx+1] ? data.beatTrack[idx+1].timing : data.songLength)) return;

      // 曲長すぎでtempCanvasが無くなっても終了
      const tempCanvas = tempCanvases[Math.floor(i/canvasRatio/canvas.width)];
      if (!tempCanvas) return;

      const context = tempCanvas.getContext('2d');
      context.fillStyle = '#000';
      context.globalAlpha = ((cnt % beat.value[0]) === 0) ? 0.2 : 0.1;
      context.fillRect(i/canvasRatio%canvas.width, 0, 1, canvas.height);

      i += data.header.resolution/(beat.value[1]/4);
    }
  });
}

function _sortDrawNotes (events, note, noteVariable, lastNoteOffTiming, canvasRatio) {
  let timingOld = -1;
  let idx = events.length-1;

  for(let n=note[noteVariable].length-1; n>=0; n--){
    let v = note[noteVariable][n];
    let t = Math.floor(v.timing/canvasRatio)*canvasRatio;
    if(timingOld==t) continue;
    timingOld = t;
    if(v.timing>lastNoteOffTiming) break;

    let eventObj;
    for(; idx>=0; idx--){
      eventObj = events[idx];
      if(t >= eventObj.timing) break;
    }

    if(eventObj && t==eventObj.timing){
      eventObj[noteVariable] = v.value;
      idx--;
    } else {
      idx++;
      eventObj = {timing:t}
      eventObj[noteVariable] = v.value;
      // events.splice(idx, 0, eventObj); を軽量化
      if(idx == 0) events.unshift(eventObj);
      else if(idx == events.length) events.push(eventObj);
      else events.splice(idx, 0, eventObj);
    }
  }
}

function drawPianoRollNotes (data, canvas, tempCanvases, options) {
  const {
    canvasRatio,
    noteHeight,
    canvasBottomMargin
  } = options

  const percussionNote = {
    y: [0, 0, 0, 0, noteHeight/4, noteHeight/4],
    h: [noteHeight, noteHeight, noteHeight, noteHeight, noteHeight/2, noteHeight/2],
    a: [1, 1, 1, 0.9, 0.6, 0.2]
  }

  for (let i=data.channels.length-1; i>=0; i--) {
    let barWidth = canvasRatio;
    data.channels[i].notes.forEach((note)=> {
      const events = []; // [{timing, pitchBend, expression, modulation}, ...] (timing ascending order)
      _sortDrawNotes(events, note, 'pitchBend', data.lastNoteOffTiming, canvasRatio);
      _sortDrawNotes(events, note, 'expression', data.lastNoteOffTiming, canvasRatio);
      _sortDrawNotes(events, note, 'modulation', data.lastNoteOffTiming, canvasRatio);

      let holdBeforeStop = Number.MAX_SAFE_INTEGER;
      if (note.holdBeforeStop) {
        _sortDrawNotes(events, note, 'holdBeforeStop', data.lastNoteOffTiming, canvasRatio);
        holdBeforeStop = Math.floor(note.holdBeforeStop[0].timing/canvasRatio)*canvasRatio;
      }

      let pitchBend = note.pitchBend[0].value;
      let expression = note.expression[0].value;
      let modulation = note.modulation[0].value;

      let idx = 1;
      let xStop = (note.stop >= data.lastNoteOffTiming) ? data.lastNoteOffTiming : note.stop;
      for (let x = Math.floor(note.start/canvasRatio)*canvasRatio; x <= xStop; ) {
        if (note.channel != 9) {
          if (idx < events.length) {
            barWidth = events[idx].timing - x;
          } else {
            barWidth = xStop - x + 1;
          }
        }

        for(let c=0; Math.floor(x/canvasRatio/canvas.width)+c <= Math.floor((x+barWidth)/canvasRatio/canvas.width); c++){
          const tempCanvas = tempCanvases[Math.floor(x/canvasRatio/canvas.width) + c];

          if (tempCanvas) {
            const context = tempCanvas.getContext('2d');
            const bar = {
              x: (x/canvasRatio)%canvas.width-c*canvas.width,
              y: 384-(note.pitch+pitchBend)*noteHeight+canvasBottomMargin-noteHeight,
              w: Math.floor(barWidth/canvasRatio),
              h: noteHeight
            };

            context.fillStyle = ChannelColor[note.channel];
            context.globalAlpha = note.velocity*(expression/127) * 0.5 + 0.5;

            // パーカッション
            if(note.channel === 9){
              for(let p=0; p<6; p++){
                const _tempCanvas = tempCanvases[Math.floor((x/canvasRatio + p)/canvas.width) + c];
                const _context = _tempCanvas.getContext('2d');

                _context.globalAlpha = (note.velocity*(expression/127)) * percussionNote.a[p];
                _context.fillRect(bar.x + p, bar.y+(percussionNote.y[p]), 1, percussionNote.h[p]);
              }
              return;
            }

            if (modulation == 0) {
              // モジュレーション無し描画
              if ((note.holdBeforeStop == null) ||
                (noteHeight <= 2) ||
                (x < holdBeforeStop)) {
                context.fillRect(bar.x, bar.y, bar.w, bar.h);
              //  console.log(bar.x, bar.y, bar.w, bar.h)
             //   debugger;
              } else {
                // ホールドは白抜き描画
                context.fillRect(bar.x, bar.y, bar.w, 1);
                context.fillRect(bar.x, bar.y+bar.h-1, bar.w, 1);
                if (idx >= events.length) {
                  context.fillRect(bar.x+bar.w-1, bar.y+1, 1, bar.h-2);
                }
              }
            } else {
              // モジュレーション有り描画
              for (let mx=0; mx<bar.w; mx++) {
                let mAng = -Math.sin((bar.x+mx+c*canvas.width) * (Math.PI/180) * 60);
                let mGain = modulation / 127;
                if ((note.holdBeforeStop == null) ||
                  (x < holdBeforeStop) ||
                  ((idx >= events.length) && (mx >= bar.w-1))){
                  context.fillRect(bar.x+mx, bar.y+(mAng*bar.h/4)*mGain, 1, bar.h-(mAng*bar.h/2)*mGain);
                } else {
                  context.fillRect(bar.x+mx, bar.y+(mAng*bar.h/4)*mGain, 1, 1);
                  context.fillRect(bar.x+mx, bar.y+bar.h-1-(mAng*bar.h/4)*mGain, 1, 1);
                }
              }
            }
          }
        }

        if (idx < events.length) {
          const ev = events[idx];
          if (ev.pitchBend != null) pitchBend = ev.pitchBend;
          if (ev.expression != null) expression = ev.expression;
          if (ev.modulation != null) modulation = ev.modulation;
        }

        x += barWidth;
        idx++;
      }
    });
  }
}

export function prerendering (data, canvas, options) {
  const tempCanvasLength = Math.min((data.songLength/options.canvasRatio), 100000); // 1000000を明示的に上限に
  const tempCanvases = [];
  for (let i=0; i <= tempCanvasLength; i += canvas.width) {
    const c = document.createElement('canvas')
    c.width = canvas.width
    c.height = canvas.height
    tempCanvases.push(c);
  }

  if (!(options && options.noLines)) {
    // 背景拍子の描画
    drawPianoRollBeats(data, canvas, tempCanvases, options.canvasRatio)
  }

  // ノートの描画
  drawPianoRollNotes(data, canvas, tempCanvases, options)

  return tempCanvases
}

export function rendering (x, canvas, context, tempCanvases, options) {
  function _mod (a, b) {
    return(a*b<0)*b+a%b
  }

  // ピアノロール描画
  let canvasW = tempCanvases[0] ? tempCanvases[0].width : canvas.width
  if (true) {
    // 常時スクロール
    let addX = -_mod(x, canvasW);
    for (let i=0; i<Math.ceil(canvas.width/canvasW)+1; i++) {
      let canvasesIdx = Math.floor(x/canvasW)+i;
      let tempCanvas = tempCanvases[canvasesIdx];
      if (tempCanvas) {
        context.drawImage(tempCanvas, addX, 0);
      }
      addX += canvasW;
    }

    // 再生ライン
    if (!(options && options.noLines)) {
      context.fillStyle = '#888';
      context.fillRect(Math.floor(canvasW/2), 0, 1, canvas.height);
    }
  } else {
    // ページ切り替わり
    let subW = canvas.width - canvasW;
    let canvasesBaseIdx = Math.floor((x+Math.ceil(canvas.width/2))/(canvasW+subW));
    let canvasesSubIdx = Math.floor((subW*canvasesBaseIdx)/(canvasW));
    let addX = -(_mod(subW*canvasesBaseIdx, (canvasW)));
    for (let i=0; i<Math.ceil(canvas.width/canvasW); i++) {
      let canvasesIdx = canvasesBaseIdx+canvasesSubIdx+i;
      let tempCanvas = tempCanvases[canvasesIdx];
      if (tempCanvas) {
        context.drawImage(tempCanvas, addX, 0);
      }
      addX += canvasW;
    }

    // 再生ライン
    context.fillStyle = '#888';
    context.fillRect(Math.floor((x+canvas.width/2)%(canvasW+subW)), 0, 1, canvas.height);
  }
}

export function getBackgroundCanvas(width, height, noteHeight, bottomMargin) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')

  for (let i = 0; i < 128; i++) {
    if ([1, 3, 6, 8, 10].some(k => (i % 12 === k))) {
      context.fillStyle = '#eee'
      context.fillRect(
        0,
        (128 * noteHeight) - ((i - 9) * noteHeight) - bottomMargin, // なぜ9...?
        canvas.width,
        noteHeight
      )
    } else if (i % 12 === 11) {
      context.fillStyle = '#ccc'
      context.fillRect(
        0,
        (128 * noteHeight) - ((i - 9) * noteHeight) - bottomMargin,
        canvas.width,
        1
      )
    }
  }

  return canvas
}
