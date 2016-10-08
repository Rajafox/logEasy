(function (global){
  // 'use strict'

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


// Global config for the created Logger instance. Its a singleton instance.
  var globalConfig = {
    // NO logging is done if false.
    enabled : true,
    loggingLevel : 'ALL',
    logToConsole : true,
    // By default server logging would be turned off.
    logToServer : false,

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
    // If we require to load properties from external properties file.
    getPropFromFile : false,
    // Use a json file for reading the properties as it would a less of a overhead for translation.
    logPropFile : "/logEasy/logEasy.json",
    // Default url that would be used for sending the loginfo to the server.
    // Would work with after writing a server side code to  support its testing.
    logPostUrl : "/saveLog",
    showInternalLogs : true,
    // Server log success handler
    serverLogHandler : null,
    // Handler for catching all the error its actually a handler for onerror case
    catchAllHandler : null,
    // Enable error handling for uncaught exceptions.
    isCatchAll : false
  };

/**
 * LogInfo class to serve as the repository for the javascript error object class.
 */
function LogInfo (lineNumber , functionName , stackTrace , fileName , severity , message) {
  this.lineNumber = lineNumber;
  this.functionName = functionName;
  this.stackTrace = stackTrace;
  this.fileName = fileName;
  this.severity = severity;
  this.message = message;
}
/**
*To Create a logInfo object especially for containing error related info.
*/
 function createLogInfoObj (error , functionName , severity ) {
  if (error instanceof Error) {
    return new LogInfo (error.lineNumber || "" , functionName , error.stack || "" , error.fileName || "" , severity , error.message  || "" );
  }
  if (error instanceof String) {
    return new LogInfo (null , functionName , null , null , severity , error);
  }
  if (error instanceof Object ) {
    return new LogInfo ( null , functionName , null , null , severity , JSON.stringify(error) );
  }
}

// TO Catch all other errors if required.
window.onerror = function ( msg, url, line, col, error ) {
  if( globalConfig.logToConsole === true && globalConfig.showInternalLogs === true && globalConfig.isCatchAll === true && globalConfig.catchAllHandler !== null && globalConfig.catchAllHandler instanceof Function ){
     globalConfig.catchAllHandler( msg, url, line, col, error );
     return true;
  }
  return false;
}

/**
 *Exposed Logger instance.
 *We create Logger instance on the global context so that it is shared across the application.
 */
  global.Logger = {
/**
 * init method is not compulsory to be called but highly recommended so that we configure the Logger properly with properties .
 */
    init : function( options ){
      if (typeof options !== "undefined" && null !== options ){

        extend(globalConfig , options);
      }
       if ( checkIfConsolePresent() !== true ){
         globalConfig.logToConsole = false ;
       }
       if( globalConfig.getPropFromFile === true ){
         ajaxRequest (globalConfig.logPropFile , 'GET', function( data ){
           // Handle the case when the file takes time to load the properties tll that time no logging statement should be executed.
           extend (globalConfig , JSON.parse (data));
           if( globalConfig.logToConsole === true && globalConfig.showInternalLogs === true ){
              console.log( "Loaded the properties from " + globalConfig.logPropFile );
           }
         });
       }


    },
    setLoggingLevel : function ( lvl ) {
      globalConfig.severityLevels = lvl;
    },
    trace : function (message) {
      this.log( 'TRACE' , message );
    },
    debug : function (message) {
      this.log( 'DEBUG' , message );
    },
    info : function (message) {
      this.log( 'INFO' , message );
    },
    warn : function (message) {
      this.log( 'WARN' , message );
    },
    error : function (message) {
      this.log( 'ERROR' , message );
    },
    fatal : function (message) {

      this.log( 'FATAL' , message );

    },
    log : function ( severity , message) {
      if ( typeof severity === 'string' && severityLevels [ severity.toUpperCase() ] >= severityLevels [globalConfig.loggingLevel]) {
        if (globalConfig.logToConsole === true) {
          console.log ( generateLogStr ( globalConfig.logToConsole , globalConfig.logFormat , arguments.callee.caller ? arguments.callee.caller.name.toString() : "[ Global Object ]" , severity , message ))
        }
        if( globalConfig.logToServer === true ){
              if( globalConfig.logToConsole === true && globalConfig.showInternalLogs === true ){
                 console.log( "Server log request initiated.");
              }
                ajaxRequest(globalConfig.logPostUrl , 'POST', function( data ){

                  if( globalConfig.serverLogHandler != null && globalConfig.serverLogHandler instanceof Function ){
                    globalConfig.serverLogHandler(data);
                  }

                  if( globalConfig.logToConsole === true && globalConfig.showInternalLogs === true ){
                     console.log( "Server log request complete.");
                  }
                }, createLogInfoObj (message , arguments.callee.caller ? arguments.callee.caller.name.toString() : "[ Global Object ]" , severity ) ) ;
        }
      }
    }
  };

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

  /**
   *Check also if console present.If not present no logging done on console.
   */
  function checkIfConsolePresent () {
    if (window.console) {
       return true;
    }
    return false;
  }
  /**
 * Get contents of a file using AJAX also send data to server using the same method.
 *
 */
function ajaxRequest( url, method, callback, data ){

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

  xmlhttp.open(method, url, true);
  if(method === 'GET'){
    xmlhttp.send();
  }
  if( method === 'POST'){
    xmlhttp.send( data );
  }

}

// Jquery Extend equivalent
function extend(){
    for(var i=1; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
}
  // return Logger;
})(this);
