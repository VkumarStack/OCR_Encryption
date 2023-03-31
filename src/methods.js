import seedrandom from "seedrandom";

function encrypt(message, key) {
    let { mappings } = mapLetters(key);

    let output = '';
    let random = seedrandom(key);
    for (let i = 0; i < message.length; i++) {
        if (message[i].match(/[a-z]/i)) {
            let index = Math.round(random());
            let chars = shuffle([0, 1, index], random());
            for (let j = 0; j < chars.length; j++)
                output += mappings[message[i].toUpperCase()][chars[j]];
            random = seedrandom(random());
        }
        else if (message[i] == ' ' || message[i] == '\n')
            output += '___';
        else 
            output += message[i] + message[i] + message[i];
    }
    return output;
}

// If alphabetical character, scan the three
// Otherwise, record the first non-alphabetical character, determine what it is, and then skip ahead 
//(certain non-alphabetical characters like underscores may be combined by the OCR)
function decrypt(message, key) {
    let { reverseMappings } = mapLetters(key);

    let output = '';
    let i = 0;
    while (i < message.length) {
        if (!message[i].match(/[a-z]/i)) {
            if (i != 0 && message[i] != message[i - 1])
                output += message[i];
            i++;
        }
        else {
            if (i + 2 < message.length && message.substring(i, i + 3).match(/[a-z]/i)) {
                let c1 = reverseMappings[message[i]];
                let c2 = reverseMappings[message[i + 1]];
                let c3 = reverseMappings[message[i + 2]];
                if (c1 == c2 || c1 == c3)
                    output += c1;
                else if (c2 == c3)
                    output += c2;
                else 
                    output += c1;
            }
            i = i + 3;
        }
    }

    return output;
}

// Map only English letters, and map one lowercase letter and one uppercase 
// letter BOTH to one uppercase letter (i.e. A, e -> B)
// A decrypted message, therefore, will only be in uppercase
function mapLetters(key) {
    let uppercase = shuffle("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(''), key);
    let lowercase = shuffle("abcdefghijklmnopqrstuvwxyz".split(''), key.split('').reverse().join(''));
    
    let mappings = {};
    let reverseMappings = {};
    for (let c = "A", i = 0; c != String.fromCharCode("Z".charCodeAt(0) + 1); c = String.fromCharCode(c.charCodeAt(0) + 1), i++) {
        mappings[c] = [uppercase[i], lowercase[i]]; 
        reverseMappings[uppercase[i]] = c;
        reverseMappings[lowercase[i]] = c;
    }
    
    return { mappings, reverseMappings };
}


// Fisher-Yates shuffle
function shuffle(array, seed) {
    let m = array.length, t, i;
    let random = seedrandom(seed);
    while (m) {
        i = Math.floor(random(seed) * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

export {shuffle, mapLetters, encrypt, decrypt}