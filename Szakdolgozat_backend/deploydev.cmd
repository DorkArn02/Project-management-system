C:\Windows\System32\inetsrv\appcmd stop apppool /apppool.name:"Szakdolgozat_backend"

robocopy /MIR "C:\Users\arnold\Desktop\Szakdolgozat mappa\Project-management-system\Szakdolgozat_backend\Szakdolgozat_backend\" "C:\inetpub\wwwroot\api" /COPY:DAT /W:3 /XF configuration.json

cd ..

C:\Windows\System32\inetsrv\appcmd start apppool /apppool.name:"Szakdolgozat_backend"