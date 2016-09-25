(function (global){
  // 'use strict'
  /**
 * Get contents of a file using AJAX.
 *
 * @param {String} url - Url to load
 * @param {Function} callback - Callback to be executed after loading.
 * @private
 */
function ajaxGet(url, callback){

  var xmlhttp;

  // get XMLHttpRequest
  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } else {
    //	for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4) {
      if(xmlhttp.status === 200){
        callback(xmlhttp.responseText);
      }else {
        callback(xmlhttp.status);
      }
    }
  };
  // async request
  xmlhttp.open('GET', url, true);
  xmlhttp.send();
}

// Jquery Extend equivalent
function extend(){
    for(var i=1; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
}
  // Create constants for severity levels
  var severityLevels = {
    // Lesser the number, lesser the severity
    // If a severity is selected logging for all the higher levels is also done.
    ALL : 0,
    TRACE : 1,
    DEBUG : 2,
    INFO : 3,
    WARN : 4,
    ERROR : 5,
    FATAL : 6,
    NONE : 999
  };

  //Check also if console present
  function checkIfConsolePresent () {
    if (window.console) {
       return true;
    }
    return false;
  }

  // Generate String represent of the log record.
  function generateLogStr (isConsolePresent , msgTemplate , functionName , severityLvl , msg){
    if (isConsolePresent === true) {
      var str = msgTemplate;
      if ( typeof msg === "string" ){
        str = str.replace ('$msg' , msg);
      }
      else if ( typeof msg === "object") {
        if( msg instanceof Error ) {
          var logObj = createLogInfoObj (msg , functionName , severityLvl);
          str = str.replace ('$msg' , logObj.message)
                .replace ('$lineNo' , logObj.lineNumber)
                .replace ('$fileName' , logObj.fileName)
                .replace ('$stack' , logObj.stackTrace);

        }
        else {
          str = str.replace ('$msg' , JSON.stringify (msg) );
        }

      }
       if ( typeof severityLvl === "string" && typeof severityLevels [severityLvl] !== "undefined" && severityLevels [severityLvl] !== null ) {
         str = str.replace ('$lvl' , severityLvl );
       }

       if (typeof functionName !== "undefined" && functionName !== null ) {
            str = str.replace ('$func' , functionName );
       }

        str = str.replace ('$time' , new Date(Date.now()) ).replace(/(^|\W)\$(\w+)/g,"");

       return str;
    }
  }

  // Also feaature to configure using config obj should be available
  // Check for ajax call support
  // Probably I would go with a hook for any server side technology.
  //  Enable all error logging automatically
  // DO something so that logger object is created only once on the global when init is called not before that.
  // How to extract useful info from the error object.
  // How to distinguish normal json object from error object.
  // Provide a mechanism to send the string being displayed on the console or the logInfo object itself to server.
  // provide batch logging to server or time Based logging.

// Global config for the created Logger instance. Its a singleton instance.
  var globalConfig = {
    // NO logging is done if false.
    enabled : true,
    loggingLevel : 'ALL',
    logToConsole : true,
    // By default server logging would be turned off.
    logToServer : false,
    // We cannot use FileWriter API due to its limited support.
    // Thus would only use Ajax calls to maintain a log file on the hosted server.
    // logToFile : false,

    // Allow user to create the template.
    // We would be using Set of constants that when specified in the string would be replaced by the value they represent.
    // List of these constants is as follows:
    // $lvl : severity of error
    // $func : function name where the logging statement is written.
    // $msg : String message for the error.
    // $stack : If the error object is passed to the log statement, get the stack from it.
    // $lineNo : Error line number from error object.
    // $fileName : fileName of the error from error object.
    // $time : time
    logFormat : 'Error of Severity : $lvl occured in $func At $time. Message : $msg at line $lineNo',

    // Use a json file for reading the properties as it would a less of a overhead for translation.
    logPropFile : "/logEasy/logEasy.json",
    // Default url that would be used for sending the loginfo to the server.
    // Would work with after writing a server side code to  support its testing.
    logPostUrl : "/saveLog"
  };

// LogInfo class to serve as the repository for the javascript error object class.
function LogInfo (lineNumber , functionName , stackTrace , fileName , severity , message) {
  this.lineNumber = lineNumber;
  this.functionName = functionName;
  this.stackTrace = stackTrace;
  this.fileName = fileName;
  this.severity = severity;
  this.message = message;
}
  // To Create a logInfo object especially for containing error related info.
 function createLogInfoObj (error , functionName , severity ) {
  if (error instanceof Error) {
    return new LogInfo (error.lineNumber , functionName , error.stack , error.fileName , severity , error.message);
  }
}


// window.onerror = function () {
//   return false;
// }
// Exposed Logger instance.
  global.Logger = {

    init : function( options ){
      if (typeof options !== "undefined" && null !== options ){

        extend(globalConfig , options);
      }
       if ( checkIfConsolePresent() !== true ){
         globalConfig.logToConsole = false ;
       }
      ajaxGet (globalConfig.logPropFile , function( data ){
        // Handle the case when the file takes time to load the properties tll that time no logging statement should be executed.
        extend (globalConfig , JSON.parse (data));
      });

    },
    setLoggingLevel : function ( lvl ) {
      globalConfig.severityLevels = lvl;
    },
    trace : function (message) {
      if (severityLevels ['TRACE'] >= severityLevels [globalConfig.loggingLevel]) {
        if ( globalConfig.logToConsole === true) {
          console.log ( generateLogStr ( globalConfig.logToConsole , globalConfig.logFormat , arguments.callee.caller ? arguments.callee.caller.name.toString() : "[ Global Object ]" , 'TRACE' , message ))
        }
      }
    },
    debug : function (message) {
      if (severityLevels ['DEBUG'] >= severityLevels [globalConfig.loggingLevel]) {
        if (globalConfig.logToConsole === true) {
          console.log ( generateLogStr ( globalConfig.logToConsole , globalConfig.logFormat , arguments.callee.caller ? arguments.callee.caller.name.toString() : "[ Global Object ]" , 'DEBUG' , message ))
        }
      }
    },
    info : function (message) {
      if (severityLevels ['INFO'] >= severityLevels [globalConfig.loggingLevel]) {
        if (globalConfig.logToConsole === true) {
          console.log ( generateLogStr ( globalConfig.logToConsole , globalConfig.logFormat , arguments.callee.caller ? arguments.callee.caller.name.toString() : "[ Global Object ]" , 'INFO' , message ))
        }
      }
    },
    warn : function (message) {
      if (severityLevels ['WARN'] >= severityLevels [globalConfig.loggingLevel]) {
        if (globalConfig.logToConsole === true) {
          console.log ( generateLogStr ( globalConfig.logToConsole , globalConfig.logFormat , arguments.callee.caller ? arguments.callee.caller.name.toString() : "[ Global Object ]" , 'WARN' , message ))
        }
      }
    },
    error : function (message) {
      if (severityLevels ['ERROR'] >= severityLevels [globalConfig.loggingLevel]) {
        if (globalConfig.logToConsole === true) {
          console.log ( generateLogStr ( globalConfig.logToConsole , globalConfig.logFormat , arguments.callee.caller ? arguments.callee.caller.name.toString() : "[ Global Object ]" , 'ERROR' , message ))
        }
      }
    },
    fatal : function (message) {
      if (severityLevels ['FATAL'] >= severityLevels [globalConfig.loggingLevel]) {
        if (globalConfig.logToConsole === true) {
          console.log ( generateLogStr ( globalConfig.logToConsole , globalConfig.logFormat , arguments.callee.caller ? arguments.callee.caller.name.toString() : "[ Global Object ]" , 'FATAL' , message ))
        }
      }
    },
    log : function ( severity , message) {
      if (severityLevels [severity] >= severityLevels [globalConfig.loggingLevel]) {
        if (globalConfig.logToConsole === true) {
          console.log ( generateLogStr ( globalConfig.logToConsole , globalConfig.logFormat , arguments.callee.caller ? arguments.callee.caller.name.toString() : "[ Global Object ]" , severity , message ))
        }
      }
    }
  };
  // return Logger;
})(this);
