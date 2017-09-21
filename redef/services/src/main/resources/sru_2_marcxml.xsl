<?xml version="1.0"?>
<xsl:stylesheet version="2.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:SRU="http://www.loc.gov/zing/sru/"
                xmlns:slim="http://www.loc.gov/MARC21/slim"
                xmlns:marcxchange="info:lc/xmlns/marcxchange-v1"
                xpath-default-namespace="http://www.loc.gov/MARC21/slim">
    <xsl:template match="SRU:searchRetrieveResponse/SRU:records">
        <slim:collection>
            <xsl:apply-templates/>
        </slim:collection>
    </xsl:template>

    <xsl:template match="SRU:record/SRU:recordData/marcxchange:record">
        <slim:record>
            <xsl:apply-templates/>
        </slim:record>
    </xsl:template>

    <xsl:template match="marcxchange:leader">
        <!-- replace leader -->
        <slim:leader>        a                </slim:leader>
    </xsl:template>

    <xsl:template match="marcxchange:controlfield">
        <slim:controlfield>
            <xsl:copy-of select="@*"/>
            <xsl:value-of select="."/>
        </slim:controlfield>
    </xsl:template>

    <xsl:template match="marcxchange:datafield">
        <slim:datafield>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates/>
        </slim:datafield>
    </xsl:template>

    <xsl:template match="marcxchange:subfield">
        <slim:subfield>
            <xsl:copy-of select="@*"/>
            <xsl:value-of select="."/>
        </slim:subfield>
    </xsl:template>

    <xsl:template match="text()"/>
</xsl:stylesheet>
