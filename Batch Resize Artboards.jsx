#target illustrator
/**
 * USAGE:
 *
 * 1. Place this script in Applications > Adobe Illustrator > Presets > en_US > Scripts
 * 2. Restart Adobe Illustrator to activate the script
 * 3. The script will be available under menu File > Scripts > BatchResizeArtboards
 * 4. ... 
 */
/**
 * LICENSE & COPYRIGHT
 *
 *   ...
 *       
 *       There may have been other scripts that inspired or were used in the creation
 *       of this script. Any omissions of credits are purely accidental. If you 
 *       recognize an omission, please let me know and I will happily add credit
 *       where it is due.
 *
 *   You are free to use, modify, and distribute this script as you see fit. 
 *   No credit is required but would be greatly appreciated. 
 *
 *   Scott Lewis - scott@iconify.it
 *   http://github.com/iconifyit
 *   http://iconify.it
 *
 *   THIS SCRIPT IS OFFERED AS-IS WITHOUT ANY WARRANTY OR GUARANTEES OF ANY KIND.
 *   YOU USE THIS SCRIPT COMPLETELY AT YOUR OWN RISK AND UNDER NO CIRCUMSTANCES WILL 
 *   THE DEVELOPER AND/OR DISTRIBUTOR OF THIS SCRIPT BE HELD LIABLE FOR DAMAGES OF 
 *   ANY KIND INCLUDING LOSS OF DATA OR DAMAGE TO HARDWARE OR SOFTWARE. IF YOU DO 
 *   NOT AGREE TO THESE TERMS, DO NOT USE THIS SCRIPT.
 */
 
var originalInteractionLevel = userInteractionLevel;
userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

/**
 * Only alter the code below this point if you are an experienced JSX developer.
 */

var OPTIONS = {
    size: 64
};

var CONST = {
    SVG:        "svg ",
    SRCROOT:    "~/Desktop",
    TARGROOT:   "~/Desktop",
    CHOOSESRC:  "Select a folder of SVG files.",
    CHOOSETARG: "Choose a destination folder",
    LOGFOLDER:  "~/Desktop"
};

/**
 * Log output mode:
 * 0 = off, no logging
 * 1 = on, logging enabled
 */
var logging = 1;

/**
 *  1 = forward
 * -1 = reverse
 */
var runOrder   = 1;

var doc            = null;
var theFiles       = new Array();
var theFilesToSave = new Array();
var startPointer   = "";

if (app.documents.length != 0) {
    
    alert("Please close all open documents before running this script");
}
else {

    try {
    
        var theSourceFolder;
    
        theSourceFolder = Folder.selectDialog(CONST.CHOOSESRC, CONST.SRCROOT);
    
        logger("BatchResizeArtboards Start: " + (new Date()));
        logger("BatchResizeArtboards Source: " + theSourceFolder);

        if (theSourceFolder instanceof Folder) {

            getFilesRecursive(theSourceFolder);
        
            logger(theFiles.join("\r"));
        
            var count = theFiles.length;
            logger("Count: " + count);
        
            if (runOrder == -1) {
                theFiles.reverse();
            }
        
            var i = 0;
            for (i = 0; i < count; i++) {
            
                logger("Iteration " + i);
        
                if (i >= count) break;
            
                var f = theFiles[i];
                var fileName = f.name;
                logger("fileName: " + fileName);
            
                if (f instanceof File) {

                    try {
                        app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
                    }
                    catch(ex) {/* Exist gracefully. Doc was already closed. */}
                    try {
                        if (app.documents.length == 0) {
                            
                            app.open(f);
                            var doc = app.activeDocument;
                        }
                        logger("Open file " + f.name);
                        doResizeArtboard(doc, OPTIONS.size);
                        doc.close(SaveOptions.SAVECHANGES);
                    }
                    catch(ex) {
                        logger("ERROR: " + ex.message);  
                    }
                
                    try {
                        doc.close(SaveOptions.DONOTSAVECHANGES);
                    }
                    catch(ex) {/* Exist gracefully. Doc was already closed. */}
                }
            }
        }
    }
    catch(ex) {
    
        logger("ERROR: " + ex.message);
    }

    userInteractionLevel = originalInteractionLevel;

    logger("BatchResizeArtboards Finish: " + (new Date()));
}


/**
 *  Functions
 */

function doResizeArtboard(doc, theSize) {

    if ((isNaN(theSize)) || theSize < 1) {
        logger("BatchResizeArtboards ERROR: theSize must be a numeric value [" + theSize + "]");
    }
    else {
              
        board  = doc.artboards[doc.artboards.getActiveArtboardIndex()];
        bounds = board.artboardRect;
        
        for (i = 0; i < doc.layers.length; i++) { 
            doc.layers[i].hasSelectedArtwork = true; 
        }
        
        group = doc.groupItems.add();
        
        for (i = 0; i < doc.selection.length; i++) {
            doc.selection[i].moveToBeginning(group);
        }

        width  = group.width;
        height = group.height;
      
        // If the artwork is larger than the artboard, resize the artboard to the 
        // size of the artwork
        
        if (width > theSize)  theSize = width;
        if (height > theSize) theSize = height;
        
        // The bounds are plotted on a Cartesian Coordinate System.
        // So a 32 x 32 pixel artboard with have the following coords:
        // (assumes the artboard is positioned at 0, 0)
        // x1 = -16, y1 = 16, x2 = 16, y2 = -16

        x1 = bounds[0];
        y1 = bounds[1];
        x2 = bounds[0] + theSize;
        y2 = bounds[1] - theSize;
        
        board.artboardRect = [x1, y1, x2, y2];
        
        // Insanely, objects are positioned by top and left coordinates and not 
        // centered using the X/Y formmat above so we have to move the item 
        // from the center point of the item
      
        group.top  = y1 - ((theSize - height) / 2);
        group.left = x1 + ((theSize - width) / 2);

        var zoom = doc.activeView.zoom;
        doc.activeView.zoom = zoom + .01;
        doc.activeView.zoom = zoom;
    }
}

function getFilesRecursive(folder) {

    // var currentFolder = new Folder(folder);
    
    var files = new Folder(folder).getFiles();
    
    for (var f = 0; f < files.length; f++) {
        if (files[f] instanceof Folder) {
        
            getFilesRecursive(files[f]);
        } 
        else {
            if (files[f].name.charAt(0) != ".") {
                theFiles.push(files[f]);
            }
        }
    }            
}

function logger(txt) {  

    if (logging == 0) return;
    var file = new File(CONST.LOGFOLDER + "/log.txt");  
    file.open("e", "TEXT", "????");  
    file.seek(0,2);  
    $.os.search(/windows/i)  != -1 ? file.lineFeed = 'windows'  : file.lineFeed = 'macintosh';
    file.writeln("[" + new Date().toUTCString() + "] " + txt);  
    file.close();  
}
