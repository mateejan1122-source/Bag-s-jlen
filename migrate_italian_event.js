import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateEvent() {
    const { data, error } = await supabase.from('events').insert([
        {
            title: "Italiensk Vinaften",
            description: "Drømmer du om en aften fyldt med autentiske italienske smage, varme og god stemning?",
            start_date: "2026-03-06",
            end_date: "2026-03-08",
            image_url: "https://i.pixi.mg/i/6ce47e10d2138e072bc6c21f.png",
            is_published: true,
            details: {
                top_tag: "BEGIVENHED",
                hero_date: "FREDAG 6. - 8. MARTS 2026",
                paragraph_1: "Drømmer du om en aften fyldt med autentiske italienske smage, varme og god stemning? Hos Restaurant Bag Søjlen inviterer vi indenfor til en uforglemmelig Wine & Dine oplevelse, hvor vi hylder det klassiske italienske køkken og den fantastiske vinkultur.",
                paragraph_2: "Vores dygtige køkkenchef har sammensat en lækker og smagfuld menu, der byder på alt fra klassiske forretter til en autentisk hovedret og en skøn dessert. For at fuldende oplevelsen har vi sammensat en nøje udvalgt vinmenu, der komplimenterer hver enkelt ret perfekt.",
                info_title: "MENUEN BYDER BLANDT ANDET PÅ:",
                bullet_points: "Bruschetta med tomat, hvidløg og basilikum\nVitello Tonnato – Tynde skiver kalvekød med tuncreme\nHjemmelavet ravioli med trøffel og svampe \nKlassisk Tiramisu",
                paragraph_3: "Hver ret vil blive serveret med en nøje udvalgt italiensk vin, og vores dygtige vintjener vil fortælle lidt om de forskellige vine undervejs.",
                price_text: "Prisen er 750,- pr. person for både menu og vinmenu.",
                booking_btn_text: "BESTIL BORD TIL ARRANGEMENTET",
                location_text: "Restaurant Bag Søjlen\nHovedgaden 5, 8410 Rønde",
                time_text: "Kl. 18.00"
            }
        }
    ]).select();
    
    console.log(error ? error.message : "Success: Event migrated with ID " + data[0].id);
}

migrateEvent();
