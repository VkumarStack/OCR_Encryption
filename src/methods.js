import seedrandom from "seedrandom";

/* 
This is a very basic encryption scheme, though it is meant to be OCR-friendly by using some redundancy
The input message is converted to uppercase and each character of the input (which is only in uppercase) 
is mapped to one random uppercase alphabetical character and one random lowercase alphabetical character 
(they are not necessarily the same character). Non alphabetical characters are not translated, with the
exception of spaces and newlines, which are translated into underscores (_) and tildas (~) respectively.
Each character is then repeated three times, so that if the OCR fails to recognize one of them, the other 
two can be used to account for the failure. Which letters map to which and the ordering of the three 
characters for each letter is determined by the key, which acts as a seed to the random generator. 
*/
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
        else if (message[i] == ' ')
            output += '___';
        else if (message[i] == '\n')
            output += '~~~';
        else 
            output += message[i] + message[i] + message[i];
        output += ' ';
    }
    return output;
}

/* 
Scans through the message, using the key to construct a reverse mapping table and then check each three-character 
sequence for a translation. If there are differences in translation within each three-character sequence, then 
whichever letter a majority of the characters translate to is the one to be added to the output.
*/
function decrypt(message, key) {
    let { reverseMappings } = mapLetters(key);

    let output = '';
    let i = 0;

    while (i < message.length) {
        if (message[i].match(/\s/)) 
            i++;
        else {
            let hash = {};
            // Scan ahead, accounts for if the OCR fails to recognize a character (deletion) or fails to recognize a space
            let j = i;
            while (j < message.length && !message[j].match(/\s/) && j < i + 3) {
                let ch;
                if (message[j] in reverseMappings)
                    ch = reverseMappings[message[j]];
                else
                    ch = message[j];
                
                if (ch in hash)
                    hash[ch]++;
                else
                    hash[ch] = 1;
                
                j++;
            }
            let items = Object.keys(hash).map((key) => { return [key, hash[key]] });
            items.sort((first, second) => { return first[1] - second[1] });
            // Output is the highest recurring character
            let ch = items[items.length - 1][0];
            if (ch == '_')
                output += ' ';
            else if (ch == '~')
                output += '\n';
            else 
                output += ch;

            i = j;
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