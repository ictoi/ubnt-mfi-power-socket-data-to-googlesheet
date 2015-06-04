# NAME

Ubiquiti Networks mFi Power Socket Data Push to Google Spreadsheet

# LICENSE

Copyright (C) 2015 Václav VESELÝ ⊂ ICTOI, s.r.o.; www.ictoi.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

# PREREQUISITES

* target spreadsheet locale has to be set to United States (decimal place and date format compatibility)
* works only with socket mFi mPower mini (tested only on EU version but should be similar to US)

# INSTALLATION

* create new google spreadsheet
* go to Google Apps Script editor "Tools > Script Editor"
* copy and paste whole this script to the code editor
* adjust variables bellow in GVAR object
* publish the script as a web app (see https://developers.google.com/apps-script/guides/web#deploying_a_script_as_a_web_app)
* publish the web app with options "Execute the app as: me (your@email.address)" and "Who has access to the app: Anyone, even anonymous" (yes this is not secure :)
* run this function and authorize the script in the first run "Run > doPost"
* copy the webapp URL and update it in the line bellow starting with "cron.1.job.1.cmd" (line is long look for https://script.google.com...)
* adjust schedule in the line bellow starting with "cron.1.job.1.schedule" (see crontab http://unixhelp.ed.ac.uk/CGI/man-cgi?crontab+5)
* ssh to mfi ip address

``` bash
ssh ubnt@YOUR.MFI.IP.ADDRESS
```

* default login ubnt:ubnt
* edit /tmp/system.cfg (see vi editor commands http://www.cs.rit.edu/~cslab/vi.html)

``` bash
vi /tmp/system.cfg
```

* add following lines at the end of the file:

``` bash
cron.1.job.1.schedule=* * * * *
cron.1.job.1.status=enabled
cron.1.job.1.cmd=M=`ifconfig ath0 | grep -o -E '([[:xdigit:]]{1,2}:){5}[[:xdigit:]]{1,2}'`;P=`cat /proc/power/pf1`;R=`cat /proc/power/relay1`;V=`cat /proc/power/v_rms1`;I=`cat /proc/power/i_rms1`;(/usr/bin/wget -b --no-cookies -4 --tries=1 -o /dev/null -O /dev/null --no-check-certificate --secure-protocol=auto --post-data="mac=$M&pf1=$P&relay1=$R&v_rms1=$V&i_rms1=$I" https://script.google.com/macros/s/YOUR_WEBSERVICE_ID/exec) >/dev/null 2>&1
cron.1.status=enabled
cron.status=enabled
```

* run command to update flash:

``` bash
cfgmtd -f /tmp/system.cfg -w
```

* reboot the mfi device with:

``` bash
reboot
```
