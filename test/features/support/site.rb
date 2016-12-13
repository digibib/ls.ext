# encoding: utf-8

# http://stackoverflow.com/questions/735073/best-way-to-require-all-files-from-a-directory-in-ruby
Dir[File.dirname(__FILE__) + '/pages/**/*.rb'].each {|file| require file }

class Site
  def translate(concept)
    {
        'verk' => 'work',
        'utgivelse' => 'publication',
        'person' => 'person',
        '_person' => 'Person',
        'sted' => 'hasPlaceOfPublication',
        'utgiver' => 'corporation',
        'utgitt av' => 'publishedBy',
        'serie' => 'serial',
        'verksserie' => 'work_series',
        'emne' => 'subject',
        'hendelse' => 'event',
        'sjanger' => 'genre',
        'hovedtittel' => "mainTitle",
        'verkshovedtittel' => "work_maintitle",
        'undertittel' => "subtitle",
        'bidrag' => 'Contribution',
        'rolle' => 'role',
        'utgivelsen' => 'Publication',
        'utgivelsesår' => 'publicationYear',
        'sidetall' => 'numberOfPages',
        'språk' => 'language',
        'tittelnummer' => 'publication_record_id',
        'første' => 1,
        'andre' => 2,
        'tredje' => 3,
        'fjerde' => 4,
        'femte' => 5,
        'navn' => 'name',
        'verksnavnet' => 'verksnavn_name',
        'personnavnet' => 'person_name',
        'nasjonalitet' => 'nationality',
        'opprinnelsesland' => 'nationality'
    }[concept.downcase] || concept
  end

  def initialize(browser)
    @browser = browser
    # create methods for each type of page
    ObjectSpace.each_object(Class).select { |klass| klass < PageRoot }.each do |klazz|
      self.class.send(:define_method, klazz.name.to_sym) { klazz.new(self) }
    end
  end

  def browser
    @browser
  end

end
