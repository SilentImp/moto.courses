const logo = document.getElementById('logotype')
    , list = ['airfilter', 'frontbrakes', 'rearbrakes', 'gas', 'screwdriver', 'trench', 'wrench']
    , index = Math.floor(Math.random() * list.length);
logo.setAttribute('xlink:href', '#' + list[index]);