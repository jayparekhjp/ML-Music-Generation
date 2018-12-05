var express = require('express');
var app = express();
var path = require('path');
var busboy = require('connect-busboy');
var fs = require('fs-extra');
var MidiPlayer = require('midi-player-js');

const port = 3000;

app.use(busboy());

var Player = new MidiPlayer.Player(function(event) {
    console.log(event);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.get('/', function (req, res){
    res.render('home');
});

app.post('/upload', function (req, res, next) {
        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            fstream = fs.createWriteStream(__dirname + '/input/input.mid');
            file.pipe(fstream);
            fstream.on('close', function () {    
                console.log("Upload Finished of " + filename);              
                res.redirect('/generate');
            }
        );
    });
});

app.get('/download', function(req, res){
    var file = __dirname + '/output/output.mid';
    Player.loadFile(file);
    Player.play();
    res.download(file); // Set disposition and send it.
});

app.get('/generate' , musify);

function musify (req, res){
    var spawn = require("child_process").spawn;
    var process = spawn('python', ["src/generator.py", "input/input.mid", "output/output.mid"]);
    process.stdout.on('data', function (data) {
      res.render('download');
    });
}

app.listen(port, function (){
    console.log('App listening on port', port)
});