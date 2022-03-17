export async function generateVideo(ffmpeg, fps, images, audio, isAac, ffmpegRunningOptions = []) {
  images.forEach((image, i) => {
    ffmpeg.FS('writeFile', `image${i}.png`, image);
  });

  ffmpeg.FS('writeFile', 'audio.aac', audio);

  await ffmpeg.run(
    '-r', `${ fps }`,
    '-i', 'image%d.png',
    '-i', 'audio.aac', ...(isAac ? ['-c:a', 'copy'] : ['-acodec', 'aac', '-ab', '320k', '-ac', '2']),
    '-pix_fmt', 'yuv420p',
    ...ffmpegRunningOptions,
    'output.mp4'
  );

  const data = ffmpeg.FS('readFile', 'output.mp4');
  return data;
}
