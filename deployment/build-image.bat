@echo off
REM Function to load .env file
call :load_env_file ./version.env
REM Use the loaded environment variables
set IMAGE_TAG=%APP_NAME%:%APP_VERSION%

set IMAGE_TAG=ms-ecpay-logistics:0.0.1

docker build -f ./dockerfile --tag %IMAGE_TAG% ..
docker tag %IMAGE_TAG% asia-east1-docker.pkg.dev/sofware-design-project/customization/%IMAGE_TAG%
docker push asia-east1-docker.pkg.dev/sofware-design-project/customization/%IMAGE_TAG%
goto :eof

:load_env_file
for /f "tokens=1,2 delims==" %%a in ('type %1') do (
    set %%a=%%b
)
goto :eof
