::========================================================================================
::========================================================================================
:: This tool sends technologies to octopus
::
::========================================================================================
::========================================================================================

@if not defined LOGDEBUG set LOGDEBUG=off
@echo %LOGDEBUG%
SetLocal EnableDelayedExpansion
for /f "delims=/" %%a in ('cd') do set CURRENTPWD=%%a
for %%a in (%0) do set CMDDIR=%%~dpa
for %%a in (%0) do set TOOLNAME=%%~na
set CMDPATH=%0
set RETCODE=1

set WORKSPACE=
set BUILDNO=
set JOBURL=
set APIKEY=
set PACKVERS=

:LOOP_ARG
    set option=%1
    if not defined option goto CHECK_ARGS
    shift
    set value=%1
    if defined value set value=%value:"=%
    call set %option%=%%value%%
    shift
goto LOOP_ARG

:CHECK_ARGS
if not defined WORKSPACE (
	echo.
	echo No "workspace" defined !
	goto Usage
)
if not defined BUILDNO (
	echo.
	echo No "buildno" defined !
	goto Usage
)
if not defined PACKVERS (
	echo.
	echo No "PACKVERS" defined !
	goto Usage
)
if not defined JOBURL (
	echo.
	echo No "joburl" defined !
	goto Usage
)
if not defined APIKEY (
	echo.
	echo No "apikey" defined !
	goto Usage
)

set PATH=C:\CAST-Caches\Win64;%PATH%;%GIT_HOME%\usr\bin
set TMPFIC=%TEMP%\build.tmp

set PACKNAME=Technologies
set PACKID=
set PACKPATH=archive/upload/%PACKNAME%*.tar.gz
set ARTIPATH=archive.zip
set FSNAME=productfs01
set FSUSER=jenkins
set REMOTEOCTO=\\productfs01\EngTools\external_tools\OctopusTools\7.3.7
set LOCALOCTO=%WORKSPACE%\OctopusTool
set SSH_OPTS=-o StrictHostKeyChecking=no
set OCTOPATH=%LOCALOCTO%\Octo.exe
set OCTOSRV=https://octopus.castsoftware.com
set OCTOPROJECT=Projects-581
set SPACENAME=Spaces-22

robocopy /mir /ndl /nfl /njh /njs /np %REMOTEOCTO% %LOCALOCTO%
if errorlevel 8 goto endclean

if exist %PACKNAME% rmdir /q /s %PACKNAME%
if exist archive rmdir /q /s archive
mkdir %PACKNAME%
if errorlevel 1 goto endclean
del %PACKNAME%*.zip 2>nul

@echo Checking octo client version:
%OCTOPATH% version
if errorlevel 1 goto endclean

echo.
echo ========================================================
echo Getting package
set CMD=curl.exe %JOBURL%/lastSuccessfulBuild/artifact/*zip*/archive.zip -o %ARTIPATH%
echo.
echo Executing:
echo %CMD%
%CMD%
if errorlevel 1 goto endclean

7z.exe l %ARTIPATH% | findstr /c:" 0 files"
if not errorlevel 1 (
    echo.
    echo ERROR: The package for that build cannot be found in the job history
    goto endclean
)
7z.exe x %ARTIPATH%
if errorlevel 1 goto endclean

echo "Package version is: %PACKVERS%"

cp %PACKPATH% %PACKNAME%/Technologies.taz
if errorlevel 1 goto endclean

cd %PACKNAME%
if errorlevel 1 goto endclean

echo.
echo ========================================================
echo Create Octopus package:
cd %WORKSPACE%
set CMD=%OCTOPATH% pack --space="%SPACENAME%" --id=%PACKNAME% --version=%PACKVERS%.%BUILDNO% --format=Zip --basePath=%PACKNAME% --outFolder=%WORKSPACE% --logLevel=verbose --compressionlevel=fast
echo.
echo Executing:
echo %CMD%
%CMD%
if not %errorlevel% equ 0 goto endclean

echo.
echo ========================================================
echo Push Octopus package:
set CMD=%OCTOPATH% push --space="%SPACENAME%" --package %WORKSPACE%\%PACKNAME%.%PACKVERS%.%BUILDNO%.zip --replace-existing --server  %OCTOSRV% --apiKey %APIKEY% --logLevel=verbose
echo.
echo Executing:
echo %CMD%
%CMD%
if not %errorlevel% equ 0 goto endclean

echo.
echo ========================================================
echo Create Octopus release:
set CMD=%OCTOPATH% create-release --space="%SPACENAME%" --project=%OCTOPROJECT% --version=%PACKVERS%.%BUILDNO% --package=%PACKNAME%:%PACKVERS%.%BUILDNO% --server %OCTOSRV% --apiKey %APIKEY% --logLevel=verbose
echo.
echo Executing:
echo %CMD%
%CMD%
if not %errorlevel% equ 0 goto endclean

echo.
echo ========================================================
echo Deploy Octopus release:
set CMD=%OCTOPATH% deploy-release --space="%SPACENAME%" --project=%OCTOPROJECT% --version=%PACKVERS%.%BUILDNO% --deployto=Production --waitfordeployment --progress --server %OCTOSRV% --apiKey %APIKEY% --logLevel=verbose
echo.
echo Executing:
echo %CMD%
%CMD%
if not %errorlevel% equ 0 goto endclean

echo End of build with success.
set RETCODE=0

:endclean
cd /d %CURRENTPWD%
exit /b %RETCODE%


:Usage
    echo usage:
    echo %0 workspace=^<path^> buildno=^<build number^> joburl=^<url^> apikey=^<octopus api key^>
    echo.
    echo "buildno: build number of the job that provides the package that will be pushed"
    echo "joburl: URL of the job"
    echo.
    goto endclean
goto:eof
