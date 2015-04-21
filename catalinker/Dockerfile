FROM redef-catalinker-skeleton

MAINTAINER Oslo Public Library "digitalutvikling@gmail.com"
ENV REFRESHED_AT 2015-04-21

WORKDIR /usr/src/app/
COPY . /usr/src/app/

ENTRYPOINT ["bundle", "exec"]
CMD ["rake", "start"]

EXPOSE 4567
