export async function generateVideo(ffmpeg, fps, images, audio, ffmpegRunningOptions = []) {
  images.forEach((image, i) => {
    ffmpeg.FS('writeFile', `image${i}.png`, image);
  });

  ffmpeg.FS('writeFile', 'audio.mp3', audio);

  await ffmpeg.run(
    '-r', `${ fps }`,
    '-i', 'image%d.png',
    '-i', 'audio.mp3', '-acodec', 'aac', '-ab', '160k', '-ac', '2',
    '-pix_fmt', 'yuv420p',
    ...ffmpegRunningOptions,
    'output.mp4'
  );

  const data = ffmpeg.FS('readFile', 'output.mp4');
  return data;
}
