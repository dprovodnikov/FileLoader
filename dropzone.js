window.dropzone = function(selector, options) {

  /**********************************************
  * INIT
  **********************************************/

  let hoverClass = options.hoverClass || '',
      droppedClass = options.droppedClass || '',
      deniedClass = options.deniedClass || '',
      dropzone = document.querySelector(selector),
      loadend = options.onloadend,
      droppedFilesArray = [];

  /**********************************************
  * EVENTS
  **********************************************/

  dropzone.addEventListener('dragover', function(e) {
    e.preventDefault();

    this.classList.add(hoverClass);
  });

  dropzone.addEventListener('dragleave', function(e) {
    this.classList.remove(hoverClass);
  });

  dropzone.addEventListener('drop', function(e) {
    e.preventDefault();

    watchIfFilesAreStillLoading(filesFound => {
      loadend(droppedFilesArray);
    });

    for(let item of e.dataTransfer.items) {
      traverseFileTree(item.webkitGetAsEntry())
    }

  });

  /**********************************************
  * LOGIC
  **********************************************/

  function watchIfFilesAreStillLoading(cb) {
    let initWatcher = function() {
      let arrayInitLength = droppedFilesArray.length,

      timer = setInterval(function() {
        if(droppedFilesArray.length > arrayInitLength)
          arrayInitLength = droppedFilesArray.length;
        else {
          clearInterval(timer);
          cb(droppedFilesArray.length);
        }
      }, 450);

    };

    setTimeout(initWatcher, 200);
  }

  function traverseFileTree(item, path) {
    path = path || '';
    if(item.isFile) {

      // dont need to upload hidden files which usually starts with dot
      if(item.name.startsWith('.')) return false;

      item.file(file => {
        let fileReader = new FileReader();

        fileReader.onloadend = function(e) {
          droppedFilesArray.push({
            path: path,
            filename: file.name,
            content: e.target.result
          });
        };
        fileReader.readAsBinaryString(file);
      });
    } else {
      let dirReader = item.createReader();

      // dont need to upload hidden forders which usually starts with dot
      if(item.name.startsWith('.')) return false;

      dirReader.readEntries(function(entries) {
        for(let entry of entries)
          traverseFileTree(entry, path + item.name + '/');
      });
    }
  }

};

/**********************************************
* TEST
**********************************************/

dropzone('#dropzone', {
  hoverClass: 'hovered',
  droppedClass: 'dropped',
  deniedClass: 'denied',
  onloadend: send
});

/*
* @param array of objects each of
* which represents file with path,
* filename and content of its
*/
function send(files) {
  alert(`You have uploaded ${files.length} files`);
}
