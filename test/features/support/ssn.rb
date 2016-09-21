#!/usr/bin/env ruby -w

class SSN
  def self.generate(year)
    date = Date.new(year, rand(12) + 1, rand(28) + 1)
    d, m, y = date.day, date.month, date.year

    pins = Hash.new
    pins["male"] = []
    pins["female"] =[]

    if y.between?(1900, 1999)
      y -= 1900
      from_id = "000"
      to_id = "499"
      if y.between?(1940, 1999) and rand(2) == 0
        from_id = "900"
        to_id = "999"
      end
    elsif y.between?(1855, 1899)
      y -= 1800
      from_id = "500"
      to_id = "749"
    elsif y.between?(2000, 2039)
      y -= 2000
      from_id = "500"
      to_id = "999"
    else
      raise "Kan ikke generere fødselsenummer for gitt år."
    end

    dd = d < 10 ? "0" + d.to_s : d.to_s
    mm = m < 10 ? "0" + m.to_s : m.to_s
    yy = y < 10 ? "0" + y.to_s : y.to_s
    bday = (dd + mm + yy).split('').map { |c| c.to_i }

    id = from_id
    until id == to_id
      sex = id[2].to_i.modulo(2) == 0 ? "female" : "male"

      pin = bday + id.split('').map { |c| c.to_i }

      k, ch = 0, [3, 7, 6, 1, 8, 9, 4, 5, 2]
      pin.each_index do |i|
        k += pin[i]*ch[i]
      end
      k1 = k.modulo(11) == 0 ? 0 : 11 - k.modulo(11)

      unless k1 == 10
        pin << k1
        k, ch = 0, [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
        pin.each_index do |i|
          k += pin[i]*ch[i]
        end
        k2 = k.modulo(11) == 0 ? 0 : 11 - k.modulo(11)

        unless k2 == 10
          pin << k2
          pins[sex] << pin.join
        end
      end

      id.succ! # f.eks. "000", "001", "002" ...
    end
    pins["male"].concat(pins["female"]).sample
  end
end