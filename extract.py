import sys
import zipfile
import xml.etree.ElementTree as ET

def get_docx_text(path):
    try:
        with zipfile.ZipFile(path) as docx:
            xml_content = docx.read('word/document.xml')
        tree = ET.XML(xml_content)
        WORD_NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
        PARA = WORD_NAMESPACE + 'p'
        TEXT = WORD_NAMESPACE + 't'
        
        paragraphs = []
        for paragraph in tree.iter(PARA):
            texts = [node.text for node in paragraph.iter(TEXT) if node.text]
            if texts:
                paragraphs.append(''.join(texts))
        return '\n'.join(paragraphs)
    except Exception as e:
        return f"Error: {e}"

if __name__ == '__main__':
    with open('rulebook.txt', 'w', encoding='utf-8') as f:
        f.write(get_docx_text(r"C:\Users\prash\Downloads\NyayMitra_AI_Rulebook.docx"))
    with open('guide.txt', 'w', encoding='utf-8') as f:
        f.write(get_docx_text(r"C:\Users\prash\Downloads\NyayMitra_TechnicalDevelopmentGuide.docx"))
    print("Files written successfully.")
