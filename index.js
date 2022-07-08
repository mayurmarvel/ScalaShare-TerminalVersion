const express = require('express');
const formidable = require('formidable');

const axios = require('axios').default;
const FormData = require('form-data');
const fs = require('fs');
const uploadUrl = 'https://share.scalaproject.io/upload/store';

port = process.env.PORT || 3000;

const app = express();

//  ScalaShare Banner
const scalashare = `
░██████╗░█████╗░░█████╗░██╗░░░░░░█████╗░░██████╗██╗░░██╗░█████╗░██████╗░███████╗
██╔════╝██╔══██╗██╔══██╗██║░░░░░██╔══██╗██╔════╝██║░░██║██╔══██╗██╔══██╗██╔════╝
╚█████╗░██║░░╚═╝███████║██║░░░░░███████║╚█████╗░███████║███████║██████╔╝█████╗░░
░╚═══██╗██║░░██╗██╔══██║██║░░░░░██╔══██║░╚═══██╗██╔══██║██╔══██║██╔══██╗██╔══╝░░
██████╔╝╚█████╔╝██║░░██║███████╗██║░░██║██████╔╝██║░░██║██║░░██║██║░░██║███████╗
╚═════╝░░╚════╝░╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝╚═════╝░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚═╝╚══════╝

                  - Instantly upload your files to IPFS! -

`

// Error Banner

const errorMessage = `

█▀▀ █▀█ █▀█ █▀█ █▀█
██▄ █▀▄ █▀▄ █▄█ █▀▄

'Error uploading your file TRY AGAIN or upload ANOTHER File!'
'Max File Size is 250 MB, Don't Upload more than one File'
`


// 

app.get('/', (req, res) => {

    res.end(`
    ${scalashare}
    `)
});



app.post('/', (req, res, next) => {

    const options = {
        uploadDir: './uploads', maxFileSize: 250000000, maxFields: 1, keepExtensions: true
    }

    const form = formidable(options);

    form.on('fileBegin', (formname, file) => {
        // file.newFilename = file.originalFilename;
    });

    form.on('file', (formname, file) => {

        let selectedFile = fs.createReadStream(file.filepath);

        const postData = new FormData();
        postData.append('files', selectedFile);

        axios.post(uploadUrl, postData)
            .then(function (response) {
                console.log(response.data);

                if (response.data.status == 'pinned') {
                    fs.unlinkSync(file.filepath);
                    // console.log(`Your File : https://scala.infura-ipfs.io/ipfs/${response.data.hash}`);
                    // console.log("Uploaded Success!");

                    res.send(`
                    ${scalashare}

IPFS Link : https://scala.infura-ipfs.io/ipfs/${response.data.hash}
                    `)



                } else {
                    console.log("Uploaded FAiLeD!");
                    res.end(errorMessage);
                }
            })
            .catch(function (error) {
                console.log(error);
            });



    });



    // Parsing and Error Handling

    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }

        // res.json({ fields, files });
    });


});


app.use((error, req, res, next) => {
    if (error.status) {
        res.status(error.status);
    }
    else {
        res.status(500);
    }
    res.end(errorMessage);
})


// Server Port Listening

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port} ...`);
});
