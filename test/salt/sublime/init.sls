python-software-properties:
  pkg.installed

install_sublime:
  pkgrepo.managed:
    - ppa: webupd8team/sublime-text-2
  pkg.installed:
    - name: sublime-text
  file.symlink: # For now we have a common preferences folder linked in from the salt folder
    - name: /home/vagrant/.config/sublime-text-2/Packages/User
    - target: /vagrant/test/salt/sublime/Settings/
    - force: True
    - makedirs: True
    - user: vagrant
    - group: vagrant
