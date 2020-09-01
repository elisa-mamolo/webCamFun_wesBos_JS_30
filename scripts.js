const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo () {
    //navigator used to get the video, pass the video as true and audio as false
    navigator.mediaDevices.getUserMedia({ video: true, audio: false})
        //the above line is returning  a promise which is going to give us the localMediaStream
        .then(localMediaStream => {
            //that is running a function
            console.log(localMediaStream);
            //take the video and set the source to localMediaStream
            video.srcObject = localMediaStream;
            //video.play updates it
            video.play();
        })
        .catch(err => {
            alert("you should allow camera access", err);
        });
}

function paintToCanvas (){

    //give canvas's height and width of the camera in case the user has differnt ratio/sizes

    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    //every n milliseconds we put an image in the canvas
    setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        //take the pixels out
        let pixels = ctx.getImageData(0, 0, width, height);
        //mess with them
        //pixels = redEffect(pixels);

        //rgb split
        pixels = rgbSplit(pixels);
        //alpha shades
        ctx.globalAlpha = 0.8;

        //green screen
        // pixels = greenScreen(pixels);
        //put them back
        ctx.putImageData(pixels, 0, 0);
        
    }, 16);
}

function takePhoto() {
    //play the sound
    snap.currentTime = 0;
    snap.play();
    //take the data from the canvas
    const data = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'pictureDownload');
    link.innerHTML = `<img src="${data}" alt="Downloaded Image"/>`
    //insert link node and insert before strip.firstChild
    strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
    for (let i = 0; i < pixels.data.length; i+=4) {
      pixels.data[i + 0] = pixels.data[i + 0] + 200; // RED
      pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
      pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
    }
    return pixels;
  }

  function rgbSplit(pixels){
    for (let i = 0; i < pixels.data.length; i+=4) {
        pixels.data[i - 150] = pixels.data[i + 0] + 200; // RED
        pixels.data[i + 100] = pixels.data[i + 1] - 50; // GREEN
        pixels.data[i - 150] = pixels.data[i + 2] * 0.5; // Blue
      }
      return pixels;
  }

  function greenScreen(pixels) {
      //level object holds min and max green range
    const levels = {};
    //get all the rgb input
    document.querySelectorAll('.rgb input').forEach((input) => {
      levels[input.name] = input.value;
    });
  //we llop through every single pixel and get the blue green red and alpha values
    for (i = 0; i < pixels.data.length; i = i + 4) {
      red = pixels.data[i + 0];
      green = pixels.data[i + 1];
      blue = pixels.data[i + 2];
      alpha = pixels.data[i + 3];
  //if the red, green, blue, aplha is anywere betwen the max values 
      if (red >= levels.rmin
        && green >= levels.gmin
        && blue >= levels.bmin
        && red <= levels.rmax
        && green <= levels.gmax
        && blue <= levels.bmax) {
        // then take it out!
        pixels.data[i + 3] = 0;
      }
    }
  
    return pixels;
  }


getVideo();
video.addEventListener('canplay', paintToCanvas);


