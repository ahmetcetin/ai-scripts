/**********************************************************

IDEO - Adam Glazier
Copyright 2011
No Rights Reserved 

NOTICE:  Don't worry about using or abusing this code 

*********************************************************/

/**********************************************************
 
MoveItemsToNearestPixel.jsx

DESCRIPTION

Moves any selected objects to the nearest pixel.
 
**********************************************************/

var logging = true;

var CONST = {
    LOG_FILE_PATH: "~/Desktop/move-to-pixel-log.txt",
    MAKE_SELECTION_STR: "Please elect at least one item before running this script.",
    CREATE_DOC_STR: "Please create a document with something in it before running this script."
}


if (documents.length > 0) {
    
    var sourceDoc = activeDocument;
    var items = selection;
    var textRefs = sourceDoc.textFrames;
    var pathRefs = sourceDoc.pathItems;
    var symRefs = sourceDoc.symbolItems;
    var i = 0 ;
    
    if (items.length == 0) {
        alert(CONST.MAKE_SELECTION_STR);
    } 
    else {
        
        // move items to nearest pixel
        for (i = 0 ; i < items.length; i++) {
            try {
                items[i].left = Math.round(items[i].left);
                items[i].top = Math.round(items[i].top);
            }
            catch(e) {
                logger(e);
            }
        }
        redraw();
    }
} 
else {
    alert(CONST.CREATE_DOC_STR);
}

function logger(txt) {  

    if (logging == 0) return;
    var file = new File(CONST.LOG_FILE_PATH);  
    file.open("e", "TEXT", "????");  
    file.seek(0,2);  
    $.os.search(/windows/i)  != -1 ? file.lineFeed = 'windows'  : file.lineFeed = 'macintosh';
    file.writeln("[" + new Date().toUTCString() + "] " + txt);  
    file.close();  
} 
