/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package no.deichman.services.service;

import com.hp.hpl.jena.rdf.model.Model;

/**
 *
 * @author sbd
 */
public interface Service {
    
     Model retriveWorkById(String id);
    
}
