@REM rnode launcher script
@REM
@REM Environment:
@REM JAVA_HOME - location of a JDK home dir (optional if java on path)
@REM CFG_OPTS  - JVM options (optional)
@REM Configuration:
@REM RNODE_config.txt found in the RNODE_HOME.
@setlocal enabledelayedexpansion

@echo off


if "%RNODE_HOME%"=="" (
  set "APP_HOME=%~dp0\\.."

  rem Also set the old env name for backwards compatibility
  set "RNODE_HOME=%~dp0\\.."
) else (
  set "APP_HOME=%RNODE_HOME%"
)

set "APP_LIB_DIR=%APP_HOME%\lib\"

rem Detect if we were double clicked, although theoretically A user could
rem manually run cmd /c
for %%x in (!cmdcmdline!) do if %%~x==/c set DOUBLECLICKED=1

rem FIRST we load the config file of extra options.
set "CFG_FILE=%APP_HOME%\RNODE_config.txt"
set CFG_OPTS=
call :parse_config "%CFG_FILE%" CFG_OPTS

rem We use the value of the JAVACMD environment variable if defined
set _JAVACMD=%JAVACMD%

if "%_JAVACMD%"=="" (
  if not "%JAVA_HOME%"=="" (
    if exist "%JAVA_HOME%\bin\java.exe" set "_JAVACMD=%JAVA_HOME%\bin\java.exe"
  )
)

if "%_JAVACMD%"=="" set _JAVACMD=java

rem Detect if this java is ok to use.
for /F %%j in ('"%_JAVACMD%" -version  2^>^&1') do (
  if %%~j==java set JAVAINSTALLED=1
  if %%~j==openjdk set JAVAINSTALLED=1
)

rem BAT has no logical or, so we do it OLD SCHOOL! Oppan Redmond Style
set JAVAOK=true
if not defined JAVAINSTALLED set JAVAOK=false

if "%JAVAOK%"=="false" (
  echo.
  echo A Java JDK is not installed or can't be found.
  if not "%JAVA_HOME%"=="" (
    echo JAVA_HOME = "%JAVA_HOME%"
  )
  echo.
  echo Please go to
  echo   http://www.oracle.com/technetwork/java/javase/downloads/index.html
  echo and download a valid Java JDK and install before running rnode.
  echo.
  echo If you think this message is in error, please check
  echo your environment variables to see if "java.exe" and "javac.exe" are
  echo available via JAVA_HOME or PATH.
  echo.
  if defined DOUBLECLICKED pause
  exit /B 1
)


rem We use the value of the JAVA_OPTS environment variable if defined, rather than the config.
set _JAVA_OPTS=%JAVA_OPTS%
if "!_JAVA_OPTS!"=="" set _JAVA_OPTS=!CFG_OPTS!

rem We keep in _JAVA_PARAMS all -J-prefixed and -D-prefixed arguments
rem "-J" is stripped, "-D" is left as is, and everything is appended to JAVA_OPTS
set _JAVA_PARAMS=
set _APP_ARGS=

set "APP_CLASSPATH=%APP_LIB_DIR%\coop.rchain.rnode-0.13.0-alpha3.jar;%APP_LIB_DIR%\coop.rchain.casper-0.1.0-SNAPSHOT.jar;%APP_LIB_DIR%\coop.rchain.block-storage-0.0.1-SNAPSHOT.jar;%APP_LIB_DIR%\coop.rchain.shared-0.1.jar;%APP_LIB_DIR%\coop.rchain.models-0.1.0-SNAPSHOT.jar;%APP_LIB_DIR%\coop.rchain.rspace-0.2.1-SNAPSHOT.jar;%APP_LIB_DIR%\coop.rchain.crypto-0.1.0-SNAPSHOT.jar;%APP_LIB_DIR%\coop.rchain.comm-0.1.jar;%APP_LIB_DIR%\coop.rchain.graphz-0.1.jar;%APP_LIB_DIR%\coop.rchain.rholang-0.1.0-SNAPSHOT.jar;%APP_LIB_DIR%\JLex.jar;%APP_LIB_DIR%\java-cup-11b.jar;%APP_LIB_DIR%\java-cup-11b-runtime.jar;%APP_LIB_DIR%\org.scala-lang.scala-library-2.12.11.jar;%APP_LIB_DIR%\com.thesamet.scalapb.scalapb-runtime_2.12-0.10.8.jar;%APP_LIB_DIR%\org.http4s.http4s-dsl_2.12-0.21.24.jar;%APP_LIB_DIR%\org.http4s.http4s-blaze-server_2.12-0.21.24.jar;%APP_LIB_DIR%\org.http4s.http4s-circe_2.12-0.21.24.jar;%APP_LIB_DIR%\org.endpoints4s.algebra_2.12-1.4.0.jar;%APP_LIB_DIR%\org.endpoints4s.algebra-circe_2.12-1.4.0.jar;%APP_LIB_DIR%\org.endpoints4s.algebra-json-schema_2.12-1.4.0.jar;%APP_LIB_DIR%\org.endpoints4s.json-schema-generic_2.12-1.4.0.jar;%APP_LIB_DIR%\org.endpoints4s.json-schema-circe_2.12-1.4.0.jar;%APP_LIB_DIR%\org.endpoints4s.http4s-server_2.12-6.0.0.jar;%APP_LIB_DIR%\org.endpoints4s.openapi_2.12-3.0.0.jar;%APP_LIB_DIR%\io.circe.circe-generic_2.12-0.13.0.jar;%APP_LIB_DIR%\io.circe.circe-parser_2.12-0.13.0.jar;%APP_LIB_DIR%\org.slf4j.slf4j-api-1.7.30.jar;%APP_LIB_DIR%\org.slf4j.jul-to-slf4j-1.7.30.jar;%APP_LIB_DIR%\com.typesafe.scala-logging.scala-logging_2.12-3.9.2.jar;%APP_LIB_DIR%\ch.qos.logback.logback-classic-1.2.3.jar;%APP_LIB_DIR%\net.logstash.logback.logstash-logback-encoder-6.6.jar;%APP_LIB_DIR%\org.scalacheck.scalacheck_2.12-1.15.2.jar;%APP_LIB_DIR%\io.kamon.kamon-core_2.12-1.1.6.jar;%APP_LIB_DIR%\io.kamon.kamon-system-metrics_2.12-1.0.1.jar;%APP_LIB_DIR%\io.kamon.kamon-prometheus_2.12-1.1.2.jar;%APP_LIB_DIR%\io.kamon.kamon-zipkin_2.12-1.0.0.jar;%APP_LIB_DIR%\io.kamon.kamon-influxdb_2.12-1.0.2.jar;%APP_LIB_DIR%\org.typelevel.cats-core_2.12-2.7.0.jar;%APP_LIB_DIR%\org.typelevel.cats-tagless-macros_2.12-0.12.jar;%APP_LIB_DIR%\com.github.cb372.cats-retry_2.12-2.1.0.jar;%APP_LIB_DIR%\io.grpc.grpc-netty-1.30.2.jar;%APP_LIB_DIR%\io.grpc.grpc-services-1.30.2.jar;%APP_LIB_DIR%\org.scala-lang.jline-2.10.7.jar;%APP_LIB_DIR%\org.rogach.scallop_2.12-3.1.4.jar;%APP_LIB_DIR%\io.lemonlabs.scala-uri_2.12-3.0.0.jar;%APP_LIB_DIR%\com.thesamet.scalapb.scalapb-runtime-grpc_2.12-0.10.8.jar;%APP_LIB_DIR%\io.circe.circe-generic-extras_2.12-0.13.0.jar;%APP_LIB_DIR%\com.github.pureconfig.pureconfig_2.12-0.14.0.jar;%APP_LIB_DIR%\org.typelevel.cats-mtl-core_2.12-0.7.1.jar;%APP_LIB_DIR%\io.monix.monix_2.12-3.3.0.jar;%APP_LIB_DIR%\co.fs2.fs2-core_2.12-2.5.10.jar;%APP_LIB_DIR%\co.fs2.fs2-io_2.12-2.5.10.jar;%APP_LIB_DIR%\io.netty.netty-tcnative-boringssl-static-2.0.36.Final.jar;%APP_LIB_DIR%\org.bitlet.weupnp-0.1.4.jar;%APP_LIB_DIR%\com.roundeights.hasher_2.12-1.2.0.jar;%APP_LIB_DIR%\com.google.guava.guava-30.1-jre.jar;%APP_LIB_DIR%\org.bouncycastle.bcpkix-jdk15on-1.68.jar;%APP_LIB_DIR%\org.bouncycastle.bcprov-jdk15on-1.68.jar;%APP_LIB_DIR%\com.github.rchain.kalium-0.8.1.jar;%APP_LIB_DIR%\com.github.rchain.secp256k1-java-0.1.jar;%APP_LIB_DIR%\org.scodec.scodec-bits_2.12-1.1.23.jar;%APP_LIB_DIR%\org.typelevel.cats-effect_2.12-2.5.4.jar;%APP_LIB_DIR%\org.lightningj.lightningj-0.5.2-Beta.jar;%APP_LIB_DIR%\com.thesamet.scalapb.lenses_2.12-0.10.8.jar;%APP_LIB_DIR%\com.google.protobuf.protobuf-java-3.12.0.jar;%APP_LIB_DIR%\org.scala-lang.modules.scala-collection-compat_2.12-2.2.0.jar;%APP_LIB_DIR%\com.lihaoyi.fastparse_2.12-2.3.0.jar;%APP_LIB_DIR%\org.http4s.http4s-core_2.12-0.21.24.jar;%APP_LIB_DIR%\org.http4s.http4s-blaze-core_2.12-0.21.24.jar;%APP_LIB_DIR%\org.http4s.http4s-server_2.12-0.21.24.jar;%APP_LIB_DIR%\org.http4s.http4s-jawn_2.12-0.21.24.jar;%APP_LIB_DIR%\io.circe.circe-core_2.12-0.13.0.jar;%APP_LIB_DIR%\io.circe.circe-jawn_2.12-0.13.0.jar;%APP_LIB_DIR%\com.chuusai.shapeless_2.12-2.3.8.jar;%APP_LIB_DIR%\com.lihaoyi.ujson_2.12-1.4.0.jar;%APP_LIB_DIR%\org.scala-lang.scala-reflect-2.12.11.jar;%APP_LIB_DIR%\ch.qos.logback.logback-core-1.2.3.jar;%APP_LIB_DIR%\com.fasterxml.jackson.core.jackson-databind-2.12.0.jar;%APP_LIB_DIR%\org.scala-sbt.test-interface-1.0.jar;%APP_LIB_DIR%\com.typesafe.config-1.4.0.jar;%APP_LIB_DIR%\org.hdrhistogram.HdrHistogram-2.1.11.jar;%APP_LIB_DIR%\com.lihaoyi.fansi_2.12-0.2.4.jar;%APP_LIB_DIR%\io.kamon.sigar-loader-1.6.5-rev003.jar;%APP_LIB_DIR%\org.nanohttpd.nanohttpd-2.3.1.jar;%APP_LIB_DIR%\io.zipkin.reporter2.zipkin-reporter-2.2.3.jar;%APP_LIB_DIR%\io.zipkin.reporter2.zipkin-sender-okhttp3-2.2.3.jar;%APP_LIB_DIR%\com.squareup.okhttp3.okhttp-3.9.1.jar;%APP_LIB_DIR%\org.typelevel.cats-kernel_2.12-2.7.0.jar;%APP_LIB_DIR%\org.typelevel.simulacrum-scalafix-annotations_2.12-0.5.4.jar;%APP_LIB_DIR%\org.typelevel.cats-tagless-core_2.12-0.12.jar;%APP_LIB_DIR%\io.grpc.grpc-core-1.30.2.jar;%APP_LIB_DIR%\io.netty.netty-codec-http2-4.1.48.Final.jar;%APP_LIB_DIR%\io.netty.netty-handler-proxy-4.1.48.Final.jar;%APP_LIB_DIR%\com.google.errorprone.error_prone_annotations-2.3.4.jar;%APP_LIB_DIR%\io.perfmark.perfmark-api-0.19.0.jar;%APP_LIB_DIR%\org.codehaus.mojo.animal-sniffer-annotations-1.18.jar;%APP_LIB_DIR%\com.google.code.findbugs.jsr305-3.0.2.jar;%APP_LIB_DIR%\io.grpc.grpc-protobuf-1.30.2.jar;%APP_LIB_DIR%\io.grpc.grpc-stub-1.30.2.jar;%APP_LIB_DIR%\com.google.protobuf.protobuf-java-util-3.12.0.jar;%APP_LIB_DIR%\org.parboiled.parboiled_2.12-2.2.1.jar;%APP_LIB_DIR%\com.github.pureconfig.pureconfig-core_2.12-0.14.0.jar;%APP_LIB_DIR%\com.github.pureconfig.pureconfig-generic_2.12-0.14.0.jar;%APP_LIB_DIR%\org.lz4.lz4-java-1.7.1.jar;%APP_LIB_DIR%\org.scodec.scodec-core_2.12-1.11.7.jar;%APP_LIB_DIR%\org.scodec.scodec-cats_2.12-1.1.0-M4.jar;%APP_LIB_DIR%\org.lmdbjava.lmdbjava-0.8.1.jar;%APP_LIB_DIR%\com.beachape.enumeratum_2.12-1.5.13.jar;%APP_LIB_DIR%\javax.xml.bind.jaxb-api-2.3.1.jar;%APP_LIB_DIR%\com.propensive.magnolia_2.12-0.17.0.jar;%APP_LIB_DIR%\com.thesamet.scalapb.compilerplugin_2.12-0.10.8.jar;%APP_LIB_DIR%\io.monix.monix-execution_2.12-3.3.0.jar;%APP_LIB_DIR%\io.monix.monix-catnap_2.12-3.3.0.jar;%APP_LIB_DIR%\io.monix.monix-eval_2.12-3.3.0.jar;%APP_LIB_DIR%\io.monix.monix-tail_2.12-3.3.0.jar;%APP_LIB_DIR%\io.monix.monix-reactive_2.12-3.3.0.jar;%APP_LIB_DIR%\io.monix.monix-java_2.12-3.3.0.jar;%APP_LIB_DIR%\com.google.guava.failureaccess-1.0.1.jar;%APP_LIB_DIR%\com.google.guava.listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;%APP_LIB_DIR%\org.checkerframework.checker-qual-3.5.0.jar;%APP_LIB_DIR%\com.google.j2objc.j2objc-annotations-1.3.jar;%APP_LIB_DIR%\com.github.jnr.jnr-ffi-2.1.15.jar;%APP_LIB_DIR%\com.lihaoyi.sourcecode_2.12-0.2.1.jar;%APP_LIB_DIR%\com.lihaoyi.geny_2.12-0.6.10.jar;%APP_LIB_DIR%\org.log4s.log4s_2.12-1.9.0.jar;%APP_LIB_DIR%\org.http4s.parboiled_2.12-2.0.1.jar;%APP_LIB_DIR%\io.chrisdavenport.vault_2.12-2.0.0.jar;%APP_LIB_DIR%\org.http4s.blaze-http_2.12-0.14.17.jar;%APP_LIB_DIR%\org.http4s.jawn-fs2_2.12-1.0.0.jar;%APP_LIB_DIR%\org.typelevel.jawn-parser_2.12-1.0.1.jar;%APP_LIB_DIR%\io.circe.circe-numbers_2.12-0.13.0.jar;%APP_LIB_DIR%\com.lihaoyi.upickle-core_2.12-1.4.0.jar;%APP_LIB_DIR%\com.fasterxml.jackson.core.jackson-annotations-2.12.0.jar;%APP_LIB_DIR%\com.fasterxml.jackson.core.jackson-core-2.12.0.jar;%APP_LIB_DIR%\io.zipkin.zipkin2.zipkin-2.4.2.jar;%APP_LIB_DIR%\com.squareup.okio.okio-1.13.0.jar;%APP_LIB_DIR%\io.grpc.grpc-api-1.30.2.jar;%APP_LIB_DIR%\com.google.code.gson.gson-2.8.6.jar;%APP_LIB_DIR%\com.google.android.annotations-4.1.1.4.jar;%APP_LIB_DIR%\io.netty.netty-common-4.1.48.Final.jar;%APP_LIB_DIR%\io.netty.netty-buffer-4.1.48.Final.jar;%APP_LIB_DIR%\io.netty.netty-transport-4.1.48.Final.jar;%APP_LIB_DIR%\io.netty.netty-codec-4.1.48.Final.jar;%APP_LIB_DIR%\io.netty.netty-handler-4.1.48.Final.jar;%APP_LIB_DIR%\io.netty.netty-codec-http-4.1.48.Final.jar;%APP_LIB_DIR%\io.netty.netty-codec-socks-4.1.48.Final.jar;%APP_LIB_DIR%\com.google.api.grpc.proto-google-common-protos-1.17.0.jar;%APP_LIB_DIR%\io.grpc.grpc-protobuf-lite-1.30.2.jar;%APP_LIB_DIR%\com.github.pureconfig.pureconfig-macros_2.12-0.14.0.jar;%APP_LIB_DIR%\com.github.pureconfig.pureconfig-generic-base_2.12-0.14.0.jar;%APP_LIB_DIR%\com.github.jnr.jnr-constants-0.9.15.jar;%APP_LIB_DIR%\com.beachape.enumeratum-macros_2.12-1.5.9.jar;%APP_LIB_DIR%\javax.activation.javax.activation-api-1.2.0.jar;%APP_LIB_DIR%\com.propensive.mercator_2.12-0.2.1.jar;%APP_LIB_DIR%\com.thesamet.scalapb.protoc-gen_2.12-0.9.0-RC2.jar;%APP_LIB_DIR%\io.monix.monix-internal-jctools_2.12-3.3.0.jar;%APP_LIB_DIR%\io.monix.implicitbox_2.12-0.2.0.jar;%APP_LIB_DIR%\org.reactivestreams.reactive-streams-1.0.3.jar;%APP_LIB_DIR%\com.github.jnr.jffi-1.2.23.jar;%APP_LIB_DIR%\com.github.jnr.jffi-1.2.23-native.jar;%APP_LIB_DIR%\org.ow2.asm.asm-7.1.jar;%APP_LIB_DIR%\org.ow2.asm.asm-commons-7.1.jar;%APP_LIB_DIR%\org.ow2.asm.asm-analysis-7.1.jar;%APP_LIB_DIR%\org.ow2.asm.asm-tree-7.1.jar;%APP_LIB_DIR%\org.ow2.asm.asm-util-7.1.jar;%APP_LIB_DIR%\com.github.jnr.jnr-a64asm-1.0.0.jar;%APP_LIB_DIR%\com.github.jnr.jnr-x86asm-1.0.2.jar;%APP_LIB_DIR%\io.chrisdavenport.unique_2.12-2.0.0.jar;%APP_LIB_DIR%\org.http4s.blaze-core_2.12-0.14.17.jar;%APP_LIB_DIR%\com.twitter.hpack-1.0.2.jar;%APP_LIB_DIR%\io.grpc.grpc-context-1.30.2.jar;%APP_LIB_DIR%\io.netty.netty-resolver-4.1.48.Final.jar;%APP_LIB_DIR%\com.thesamet.scalapb.protoc-bridge_2.12-0.9.0-RC2.jar"
set "APP_MAIN_CLASS=coop.rchain.node.Main"
set "SCRIPT_CONF_FILE=%APP_HOME%\conf\application.ini"

rem if configuration files exist, prepend their contents to the script arguments so it can be processed by this runner
call :parse_config "%SCRIPT_CONF_FILE%" SCRIPT_CONF_ARGS

call :process_args %SCRIPT_CONF_ARGS% %%*

set _JAVA_OPTS=!_JAVA_OPTS! !_JAVA_PARAMS!

if defined CUSTOM_MAIN_CLASS (
    set MAIN_CLASS=!CUSTOM_MAIN_CLASS!
) else (
    set MAIN_CLASS=!APP_MAIN_CLASS!
)

rem Call the application and pass all arguments unchanged.
"%_JAVACMD%" !_JAVA_OPTS! !RNODE_OPTS! -cp "%APP_CLASSPATH%" %MAIN_CLASS% !_APP_ARGS!

@endlocal

exit /B %ERRORLEVEL%


rem Loads a configuration file full of default command line options for this script.
rem First argument is the path to the config file.
rem Second argument is the name of the environment variable to write to.
:parse_config
  set _PARSE_FILE=%~1
  set _PARSE_OUT=
  if exist "%_PARSE_FILE%" (
    FOR /F "tokens=* eol=# usebackq delims=" %%i IN ("%_PARSE_FILE%") DO (
      set _PARSE_OUT=!_PARSE_OUT! %%i
    )
  )
  set %2=!_PARSE_OUT!
exit /B 0


:add_java
  set _JAVA_PARAMS=!_JAVA_PARAMS! %*
exit /B 0


:add_app
  set _APP_ARGS=!_APP_ARGS! %*
exit /B 0


rem Processes incoming arguments and places them in appropriate global variables
:process_args
  :param_loop
  call set _PARAM1=%%1
  set "_TEST_PARAM=%~1"

  if ["!_PARAM1!"]==[""] goto param_afterloop


  rem ignore arguments that do not start with '-'
  if "%_TEST_PARAM:~0,1%"=="-" goto param_java_check
  set _APP_ARGS=!_APP_ARGS! !_PARAM1!
  shift
  goto param_loop

  :param_java_check
  if "!_TEST_PARAM:~0,2!"=="-J" (
    rem strip -J prefix
    set _JAVA_PARAMS=!_JAVA_PARAMS! !_TEST_PARAM:~2!
    shift
    goto param_loop
  )

  if "!_TEST_PARAM:~0,2!"=="-D" (
    rem test if this was double-quoted property "-Dprop=42"
    for /F "delims== tokens=1,*" %%G in ("!_TEST_PARAM!") DO (
      if not ["%%H"] == [""] (
        set _JAVA_PARAMS=!_JAVA_PARAMS! !_PARAM1!
      ) else if [%2] neq [] (
        rem it was a normal property: -Dprop=42 or -Drop="42"
        call set _PARAM1=%%1=%%2
        set _JAVA_PARAMS=!_JAVA_PARAMS! !_PARAM1!
        shift
      )
    )
  ) else (
    if "!_TEST_PARAM!"=="-main" (
      call set CUSTOM_MAIN_CLASS=%%2
      shift
    ) else (
      set _APP_ARGS=!_APP_ARGS! !_PARAM1!
    )
  )
  shift
  goto param_loop
  :param_afterloop

exit /B 0
