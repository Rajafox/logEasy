# logEasy
A small logging library for your Javascript projects

This library aims to provide a standard mechanism for logging in Client side script with hooks to send logging information to the Server side application also.

## Setup

Include the logEasy script file in your html page and you are good to go.

## How to Use ?

### Initialization of Logger

To begin using the logger just initialize the logger instance for your javascript.

...
Logger.init();
...

We could also Config the properties for the logger by passing appropriate options to init method of Logger.

...
Logger.init( config );
...

### Configuration options

- enabled [default : true ] : If set to false would cause all the log method(s) like log ,  trace, debug etc. to be ignored.
- logging Levels [default : 'ALL'] : logging severity for the application based on which log method(s) are considered or ignored.Explained in details in next section.
- logToConsole [default : true ] : If true log statements are displayed on browser console (if console object supported).
- logToServer [default : true ] : If true then a post request is sent to the server.
- logPostUrl [default : "/saveLog" ] : url where server request would be sent.
- logFormat [default : 'Error of Severity : $lvl occured in $func At $time. Message : $msg at line $lineNo'] : template for logs to be created. User could specify his own template by using pseudo-variables.

### Logging Levels

Following logging severity levels are supported ( listed from low to high severity) :

...
TRACE
DEBUG
INFO
WARN
ERROR
FATAL
...

Each severity level has a method associated with  it.
If logging level is set using the configuration object it would include that and all levels above it.

These logging levels allow developer to control the type of message to log from the configuration object.
Suppose developer inserts three trace() statements , 2 warn() statements and 1 fatal() statement.
If in local setup developer requires all the information to be logged then in configuration object he could set logging level to 'ALL'.
However in dev might require only  WARNINGS and FATAL error logs so in that case developer could set the logging level to 'WARN'.
### Use in the application

Once the logger is initialized . We can insert the logger statement anywhere in the code where logging is desired.

Following methods are provided for logger for logging.

...

trace()
debug()
info()
warn()
error()
fatal()
log()
...

All the methods except log method accept only one argument which could be string or custom json object or javascript error object.
Log method accept first argument as the severity level.

So for logging a warning. User need to statement like :

...

Logger.warn("There is something fishy  with what you are doing.Beware!!!");

...

But when logging using more generic log method. User need to do something like :

...

Logger.log( 'WARN' , "I told you already. There is something fishy.");
...

### Server logging

This library also provide hook for your server side code to send the logged information to your server side code.
