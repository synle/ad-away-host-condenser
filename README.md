# ad-away-host-condenser
Condense ad away host files to whitelist domains. In this case whitelist links from slickdeals.

## use this host for AdAway in android
`http://adaway.herokuapp.com/hosts`
`http://adaway.herokuapp.com/h`


## config
### hosts or host file to black list
config/black.list.json

### hosts to ignore
config/white.list.json


### Sample script to register blocked sites
#### Netgear Nighthawk(R) X4S R7800
```
fetch('http://adaway.herokuapp.com/h').then(r => r.text()).then(_doWork);

function _registerBlockSiteWithNetGear(hosts){
    const exiting_hosts = [...document.querySelectorAll('#keyword_domainlist option')]
        .map(option => option.value)

    const new_hosts = hosts.split('\n')
        .map(h => {
            try{
                return h.replace('0.0.0.0', '').trim();
            } catch(e){
                return '';
            }
        });

    const all_hosts = Object.keys(
        [].concat(exiting_hosts).concat(new_hosts)
            .reduce((res,h) => {
                res[h] = true;
                return res;
            }, {})
    );

    document.querySelector('#keyword_domainlist').innerHTML = all_hosts.map(
        h => {
            return `<option value="${h}">${h}</option>`;
        }
    ).join('')
}
```
