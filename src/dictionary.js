var request = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');

module.exports = {
  titles: {
    objective: ['objective', 'objectives'],
    summary: ['summary'],
    technology: ['technology', 'technologies'],
    experience: ['experience'],
    education: ['education'],
    skills: [
		'skills and interests', 'Skills & Expertise', 'skills', 'technology', 'technologies'
	],
    languages: ['languages'],
    courses: ['courses'],
    projects: ['projects'],
    links: ['links'],
    contacts: ['contacts'],
    positions: ['positions', 'position'],
    profiles: [
      'profiles',
      'social connect',
      'social-profiles',
      'social profiles',
    ],
    awards: ['awards'],
    honors: ['honors'],
    additional: ['additional'],
    certification: ['certification', 'certifications'],
    interests: ['interests'],
  },
  profiles: [
    [
      'github.com',
      function(url, Resume, profilesWatcher) {
        download(url, function(data, err) {
          if (data) {
            var $ = cheerio.load(data),
              fullName = $('.vcard-fullname').text(),
              location = $('.octicon-location')
                .parent()
                .text(),
              mail = $('.octicon-mail')
                .parent()
                .text(),
              link = $('.octicon-link')
                .parent()
                .text(),
              clock = $('.octicon-clock')
                .parent()
                .text(),
              company = $('.octicon-organization')
                .parent()
                .text();

            Resume.addObject('github', {
              name: fullName,
              location: location,
              email: mail,
              link: link,
              joined: clock,
              company: company,
            });
          } else {
            return console.log(err);
          }
          //profilesInProgress--;
          profilesWatcher.inProgress--;
        });
      },
    ],
    [
      'linkedin.com',
      function(url, Resume, profilesWatcher) {
        download(url, function(data, err) {
          if (data) {
            var $ = cheerio.load(data),
              linkedData = {
                positions: {
                  past: [],
                  current: {},
                },
                languages: [],
                skills: [],
                educations: [],
                volunteering: [],
                volunteeringOpportunities: [],
              },
              $pastPositions = $('.past-position'),
              $currentPosition = $('.current-position'),
              $languages = $('#languages-view .section-item > h4 > span'),
              $skills = $(
                '.skills-section .skill-pill .endorse-item-name-text'
              ),
              $educations = $('.education'),
              $volunteeringListing = $('ul.volunteering-listing > li'),
              $volunteeringOpportunities = $(
                'ul.volunteering-opportunities > li'
              );

            linkedData.summary = $('#summary-item .summary').text();
            linkedData.name = $('.full-name').text();
            // current position
            linkedData.positions.current = {
              title: $currentPosition.find('header > h4').text(),
              company: $currentPosition.find('header > h5').text(),
              description: $currentPosition.find('p.description').text(),
              period: $currentPosition.find('.experience-date-locale').text(),
            };
            // past positions
            _.forEach($pastPositions, function(pastPosition) {
              var $pastPosition = $(pastPosition);
              linkedData.positions.past.push({
                title: $pastPosition.find('header > h4').text(),
                company: $pastPosition.find('header > h5').text(),
                description: $pastPosition.find('p.description').text(),
                period: $pastPosition.find('.experience-date-locale').text(),
              });
            });
            _.forEach($languages, function(language) {
              linkedData.languages.push($(language).text());
            });
            _.forEach($skills, function(skill) {
              linkedData.skills.push($(skill).text());
            });
            _.forEach($educations, function(education) {
              var $education = $(education);
              linkedData.educations.push({
                title: $education.find('header > h4').text(),
                major: $education.find('header > h5').text(),
                date: $education.find('.education-date').text(),
              });
            });
            _.forEach($volunteeringListing, function(volunteering) {
              linkedData.volunteering.push($(volunteering).text());
            });
            _.forEach($volunteeringOpportunities, function(volunteering) {
              linkedData.volunteeringOpportunities.push($(volunteering).text());
            });

            Resume.addObject('linkedin', linkedData);
          } else {
            return console.log(err);
          }
          profilesWatcher.inProgress--;
        });
      },
    ],
    'facebook.com',
    'bitbucket.org',
    'stackoverflow.com',
  ],
  inline: {
    //address: 'address',
    skype: 'skype',
  },
  regular: {
    name: [/Curriculum[\s*|\t+]Vitae[\s*|\t+]([A-Z][a-z]*\s[A-Z][a-z]*)|([A-Z][a-z]*\s[A-Z][a-z]*)/],
    email: [/([a-z0-9_\.-]+@[\da-z\.-]+\.[a-z\.]{2,6})/],
    phone: [/(^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$)/],
  },
};

// helper method
function download(url, callback) {
  url.replace('http://','')
  url.replace('https://','')
  url = 'http://'.concat(url)
  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(body);
    } else {
      callback(null, error);
    }
  });
}
