# logEasy
  A small logging library for your Javascript projects.

  This library aims to provide a standard mechanism for logging in Client side script with hooks to send logging information to the Server side application also.


## Features
  
    -  Configure logging setting from external json file.
    -  Disable all log statements with single option change.
    - Do selective logging with severity levels.
    - Hooks to send log information to server side code.
    - Option to handle all the uncaught exceptions.

## Setup

  Include the logEasy script file in your html page and you are good to go.

## How to Use ?

### Initialization of Logger

When the js file is included in the page. A default **Logger** instance is created on the global object.
It is still recommended to configure its behaviour using configuration object to tune its behaviour.

`Logger.init( config );`


### Configuration options

- **enabled [default : true ]**: If set to false would cause all the log method(s) like log ,  trace, debug etc. to be ignored.

- **logging Levels [ default : 'ALL' ]** : logging severity for the application based on which log method(s) are considered or ignored.Explained in details in next section.

- **logToConsole [ default : true ]** : If true log statements are displayed on browser console (if console object supported).

- **logToServer [ default : true ]** : If true then a post request is sent to the server.

- **logPostUrl [ default : "/saveLog" ]** : url where server request would be sent.

- **logFormat [ default : 'Error of Severity : $lvl occured in $func At $time. Message : $msg at line $lineNo' ]** : template for logs to be created. User could specify his own template by using pseudo-variables.

- **getPropFromFile [default : false ]** : To enable extracting configuration from json file. It is useful for different setting based on environment.

- **logPropFile [ default : "/logEasy/logEasy.json" ]** : Json file location (relative).Note: Place the json file in the same server location as the web package as cross domain access is not allowed.

- **logPostUrl [ default : "/saveLog" ]** : Server request url for error logging . Server error object is sent along with the post request.

- **showInternalLogs [ default : true ]** : Whether to log steps from within the plugin. This works only when *logToConsole* is also true.

- **serverLogHandler [ default : null , Signature : function ( responseData ) ]** : Response handler when server logging is done.

- **isCatchAll [ default : false ]** : Enable error handling for uncaught exceptions.

- **catchAllHandler [ default : null , signature : function ( msg, url, line, column , error ) ]** : Handler for uncaught exceptions.


### Logging Severity Levels

Following logging severity levels are supported ( listed from low to high severity) :


> TRACE < DEBUG < INFO < WARN < ERROR < FATAL


When Logging is done at any of the level mentioned above,
Then log statements would be displayed for that level and all levels greater than it.

Suppose logging is done at **'INFO'** level then as per the rule,
Log statements with severity greater than or equal to **'INFO'** i.e **'WARN'** , **'ERROR'** , **'FATAL'** would be displayed and other log statements with severity less than it i.e **'TRACE'** , **'DEBUG'** would not be displayed.

Other than these levels user could set Logging level as **'ALL'** to log all severity level logs or **'NONE'** to log none.

Each severity level has a method associated with it i.e to log a warning we could use statement:

`Logger.warn( messsage );`

Similarily  we have,

>Logger.trace( message );

>Logger.debug( message );

>Logger.info( message );

>Logger.error( message );

>Logger.fatal( message );

Note that here message could be a

- String
- Usual Javascript object with key-value pair
- Javascript error object

### Log statement Formatting

We could define a format for the log being displayed in the console.

Statement could be any sentence along with any combination psuedo-variable(s).

Folllowing are the psuedo-variable(s) :
- $lvl : severity of error
- $func : function name where the logging statement is written.
- $msg : String message for the error.
- $stack : If the error object is passed to the log statement, get the stack from it.
- $lineNo : Error line number from error object.
- $fileName : fileName of the error from error object.
- $time : time

One need to set logFormat property of configuration object using the above variables.

e.g:

> {
> logFormat : You got an error of $lvl severity in $func .
>}

with severity INFO and function where the statement is invoked being test() would translate to

> You got an error of INFO severity in test .

 in console.

 **Note**: logFormat is for the statement being displayed in console.
