#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * SQL dosyasını belirtilen sayıda parçaya böler
 * @param {string} inputFile - Bölünecek SQL dosyasının adı
 * @param {number} numberOfParts - Kaç parçaya bölüneceği
 */
function splitSqlFile(inputFile, numberOfParts = 3) {
    try {
        // Dosya boyutunu al
        const fileSize = fs.statSync(inputFile).size;
        console.log(`SQL dosya boyutu: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
        
        // Her parçanın yaklaşık boyutu
        const bytesPerPart = Math.ceil(fileSize / numberOfParts);
        console.log(`Her parça yaklaşık: ${(bytesPerPart / (1024 * 1024)).toFixed(2)} MB olacak`);
        
        // Dosya adı ve uzantısını ayır
        const baseName = path.basename(inputFile, path.extname(inputFile));
        const extension = path.extname(inputFile);
        
        // Parça dosya isimleri
        const partFiles = Array.from({ length: numberOfParts }, (_, i) => `${baseName}_part${i+1}${extension}`);
        
        // Tüm dosyayı oku
        const content = fs.readFileSync(inputFile);
        
        for (let i = 0; i < numberOfParts; i++) {
            // Parça başlangıç ve bitiş pozisyonlarını hesapla
            const startPos = i * bytesPerPart;
            let endPos = (i + 1) * bytesPerPart;
            
            // Son parça değilse, SQL ifadesinin sonuna kadar git
            if (i < numberOfParts - 1) {
                // Eğer ';' karakteri varsa, orada kes
                for (let j = endPos; j < Math.min(endPos + 1000, content.length); j++) {
                    if (content[j] === 59) { // ASCII ';' = 59
                        endPos = j + 1; // ';' karakterini dahil et
                        break;
                    }
                }
            } else {
                // Son parça dosyanın sonuna kadar
                endPos = content.length;
            }
            
            // Parçayı oluştur
            const partContent = content.slice(startPos, endPos);
            
            // Parçayı dosyaya yaz
            fs.writeFileSync(partFiles[i], partContent);
            
            console.log(`Parça ${i+1} yazıldı: ${partFiles[i]} - Boyut: ${(partContent.length / (1024 * 1024)).toFixed(2)} MB`);
        }
        
        console.log("İşlem tamamlandı!");
    } catch (error) {
        console.error(`Hata oluştu: ${error.message}`);
    }
}

// Ana program
const inputFile = "gulencanta_gunceldb.sql"; // SQL dosya adı
splitSqlFile(inputFile, 3); // 3 parçaya böl 