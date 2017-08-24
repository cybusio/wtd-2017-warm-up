# WORK THE DATA @ WHAT THE DATA Teil 1: MQTT

Daten sind zum Spielen da! Wir haben euch für den WHAT THE DATA!? Hackathon wie immer eine bunte Spielwiese vorbereitet. Damit ihr eure wertvolle Zeit am Wochenende nicht mit den Grundlagen verschwenden müsst, machen wir es euch so leicht wie möglich, an Daten zu kommen. Einen vollständigen Datenkatalog veröffentlichen wir in den nächsten Tagen. In einer kleinen Blog-Post Serie erklären wir euch die einfachsten Tools zum Durchstarten.

## Warum wir MQTT gegenüber REST bevorzugen

Wer in sich in den letzten Jahren mit Software-Entwicklung vor allem rund um Webservices beschäftigt hat, kennt den Begriff REST API in der Regel sehr gut. REST bezeichnet eine HTTP Schnittstelle, die Funktionen für das Anlegen, Auslesen, Verändern und Löschen von Datensätzen anbietet (CREATE, READ, UPDATE, DELETE -> CRUD). Das HTTP Protokoll ist ein so genanntes Request/Response Protokoll, das heißt, um mit der Schnittstelle zu interagieren, sendet ein Client stets eine Anfrage (Request) an einen Server und erhält dann eine Antwort (Response), die Status Codes, die eigentlichen Daten (Payload oder Body) und einige Metadaten enthält.

In IoT-Systemen wollen Anwendungen (Clients) oft kontinuierlich Messwerte, die in einem festen Interval von Datenquellen (z.B. Sensoren) aufgenommen werden, erhalten und verarbeiten. Mit einer reinen REST API würde der Sensor seine Daten per HTTP POST an einen Server schicken, jeder Client kann per GET den letzten Wert abholen (Polling). Daraus entstehen allerdings eine Handvoll Nachteile:

- die Anfragen sind meist redundant, da kontinuierlich immer wieder die gleiche Anfrage gestellt wird. Das verursacht unnötigen Datenverkehr
- das Timing der Anfragen ist schwer zu treffen. Um keinen Wert zu verpassen muss das Polling-Intervall höher gewählt werden, als das Publish-Interval des Sensors

```
                                                   
                                                                     
  Sensor             Server              Client A          Client B  
    │                   │                   │                 │      
    │                   │                   │                 │      
    │─POST Messwert 1─▶ │                   │                 │      
    │                   │ ◀─GET Messwert────│                 │      
    │◀────200 OK─────── │ ◀─────────────────┼──GET Messwert───│      
    │                   │ ──Messwert 1─────▶│                 │      
    │                   │ ──────────────────┼──Messwert 1────▶│      
    │                   │ ◀─GET Messwert────│                 │      
    │                   │                   │                 │      
    │─POST Messwert 2─▶ │ ──Messwert 1─────▶│                 │      
    │                   │                   │                 │      
    │◀────200 OK─────── │ ◀─GET Messwert────│                 │      
    │                   │                   │                 │      
    │                   │ ──Messwert 2─────▶│                 │      
    │                   │                   │                 │      
    │                   │ ◀─GET Messwert────│                 │      
    │─POST Messwert 3─▶ │ ◀─────────────────┼──GET Messwert───│      
    │                   │ ──Messwert 3─────▶│                 │      
    │◀────200 OK─────── │ ──────────────────┼──Messwert 3────▶│      
    ▼                   ▼                   ▼                 ▼      

Abbildung 1: IoT Live-Daten mit HTTP Request/Response. Client A fragt in zu hohem Interval 
und erhält doppelte Werte, Client B in zu niedrigem und verpasst Werte
```

MQTT ist ein so genanntes Publish/Subscribe Protokoll und ist für Fälle konzipiert worden, in denen über längere Zeiträume immer gleiche Datenpunkte von Datenquellen erzeugt und an andere Clients verteilt werden müssen. Dafür bauen alle Clients eine dauerhaft bestehende Netzwerk-Verbindung zum so genannten MQTT-Broker auf. Eine Authentifizierung mit Benutzername und Passwort bzw. Zertifikaten ist nur einmalig erforderlich. Auf dieser bestehenden Netzwerk-Verbindung können Datenquellen unter so genannten Topics senden (Publish). Andere Clients können Topics abbonnieren (Subscribe) und erhalten fortan sämtliche Daten unmittelbar per Push. Das ist elegant und effizient.

```
                                                                   
  Sensor             Broker              Client A        Client B  
    │                   │                   │               │      
    │                   │ ◀─SUB Messwert────│               │      
    │                   │ ◀─────────────────┼──SUB Messwert─│      
    │                   │                   │               │      
    │─PUB Messwert 1──▶ │                   │               │      
    │                   │ ──Messwert 1─────▶│               │      
    │                   │ ──────────────────┼──Messwert 1──▶│      
    │                   │                   │               │      
    │                   │                   │               │      
    │                   │                   │               │      
    │─PUB Messwert 2──▶ │                   │               │      
    │                   │ ──Messwert 2─────▶│               │      
    │                   │ ──────────────────┼──Messwert 2──▶│      
    │                   │                   │               │      
    │                   │                   │               │      
    │                   │                   │               │      
    │─PUB Messwert 3──▶ │                   │               │      
    │                   │ ──Messwert 3─────▶│               │      
    │                   │ ──────────────────┼──Messwert 3──▶│      
    ▼                   ▼                   ▼               ▼                                                         
Abbildung 2: IoT Live-Daten mit MQTT Pub/Sub. Alle Clients erhalten jeden neuen Wert unmittelbar 
per Push.
```

## Aber: Websockets?

Ein beliebter Irrtum ist, dass Websockets eine Alternative zu MQTT sind. Websockets ermöglicht es, Streaming-Protokolle durch HTTP zu tunneln. Dieser Datenkanal kann aber zunächst nichts anderes, als eine normale TCP Verbindung und stellt damit im OSI Modell nur den Transport-Layer zur Verfügung! Auf diesem Transport-Layer können dann wieder beliebige Application-Layer Protokolle angewendet werden, auch z.B. MQTT.

Der Hauptgrund für die Existenz von Websockets ist, dass aus einem Web-Browser heraus der Javascript Code aus Sicherheitsgründen keine direkten Netzwerk-Socket Verbindungen aufbauen kann, vielmehr kann er ausschließlich HTTP Anfragen an Web-Server stellen. Nur wenn dieser Web-Server auch Websockets unterstützt und seinerseits einen solchen Tunnel zur Verfügung stellt, kann diese Technologie genutzt werden.

Die meisten MQTT Broker haben einen eingebauten Webserver, der Websocket Verbindungen entgegen nehmen kann. Daher ist eine direkte MQTT Kommunikation aus einer Website heraus sehr einfach möglich!

Ein anderer Anwendungsfall für MQTT over Websockets sind übrigens restriktive Firewalls, die nur HTTP/HTTPS Traffic erlauben.

Zusammengefasst: Websockets sind keine Alternative zu MQTT, aber in manchen Fällen muss man MQTT over Websockets betreiben.

## Getting Started: MQTT

Eine MQTT Bibliothek ist für praktisch jede Programmiersprache verfügbar. Es sollte in der Regel nur wenige Minuten dauern, erste Daten zu erhalten, denn MQTT ist nicht kompliziert. Hier eine kleine Empfehlungsliste:

- Python: 
- Javascript: MQTT.JS https://github.com/mqttjs (NodeJS und auch im Browser verfügbar, Achtung, im Browser immer Websockets benutzen und Port 80 bzw. 443!)
- Java:
- C++: 
- C#:
- Go:
- Erlang:

Zum Debuggen und für den schnellen Schnellstart gibt es auch Web-Clients, z.B. http://www.hivemq.com/demos/websocket-client/ und für alle komplexeren Prototyping Aufgaben empfehlen wir Node-RED (https://www.nodered.org), für das wir demnächst nochmal einen eigenen Artikel veröffentlichen.

Egal welche Technologie eingesetzt wird, die Interaktion mit MQTT erfolgt immer in den gleichen Schritten:

1. Connect
2. Publish oder Subscribe
3. Unsubscribe / Disconnect (Optional)

Im Folgenden schreiben wir eine ganz oberflächliche, erste Einführung in MQTT. Wer sich genauer informieren möchte, sei auf die unzähligen Ressourcen im Internet verwiesen.

### Connect

Die Verbindung zwischen einem Client und dem Broker ist immer eine dauerhafte TCP Verbindung und nicht - wie bei HTTP - auf einen einzelnen Request beschränkt. Für die Verbindung benötigt man:

- zwingend: Broker-Hostname und Port (Default: 1883 für MQTT, 8883 für MQTT/TLS, 80 für MQTT over Websockets, 443 für MQTT over Secure Websockets)
- optional: ClientID (best practice: ClientID === Username)
- optional: Username und Password (je nach Authentifizierungs-Mechanismus)
- optional: Client-Zertifikat (je nach Authentifizierungsmechanismus)
- CleanSession Flag (per default `true`). Wenn `false` bedeutet das, dass der Broker die subscriptions auch nach Verbindungsabbruch speichert und Nachrichten zwischenpuffert die auflaufen, während der Client offline ist. Es ist dann nicht erforderlich, nach einem Reconnect neu zu subscriben, weiterhin werden beim nächsten connect alle Nachrichten nachgeliefert.

Beispiel in Javascript:

```
const mqtt = require('mqtt')

const client =  mqtt.connect(
  'mqtts://energie-campus.cybus.io', {
  clientId: 'my-user-name',
  username: 'my-user-name',
  password: 'something-secret',
  clean: true
})
```

### Publish

Eine MQTT Nachricht besteht immer aus dem so genannten Topic und einem Payload. Das Topic ist hierarchisch aufgebaut und besteht aus alphanumerischen Zeichen, getrennt durch `/`. In der Regel können Clients nur in bestimmten Topics publishen, dies wird durch ACL (Access Control Lists) geregelt. Der Payload einer Nachricht kann bis zu 256 MByte groß sein und MQTT trifft keine Annahmen über das Format des Payloads. Wichtig: Der Payload ist immer ein rein binäres Datenpaket. Das Format, in dem die Daten kodiert sind, muss also beim Client bekannt sein. 

Bei Cybus gibt es per Konvention genau zwei Arten von Payloads:

- Rohdaten, die direkt, unverarbeitet und ungeparsed aus Maschinen ausgelesen werden. Der Client muss diese Daten noch in das richtige Format (float, int, ...) umwandeln
- Qualitative Daten, die immer im JSON Format als String im Payload kodiert sind. Ein solches JSON Objekt enthält in der Regel mindestens die Felder `value` und `timestamp` und ggf. noch weitere Metadaten.

Beispiel in Javascript:

```
const data = {timestamp: Date.now(), value: 42}
client.publish('some/topic/to/publish/on', JSON.stringify(data))
```

### Subscribe

Subscriptions beziehen sich immer auf bestimmte Topics, wobei hier zusätzlich Wildcards eingesetzt werden können, um größere Topic Scopes auf einmal zu abbonnieren. Es gibt folgende Wildcards:

- `+` kann innerhalb des Topics benutzt werden und gilt für genau eine Hierarchie-Ebene
- `#` kann nur am Ende des Topics benutzt werden und gilt für beliebig viele Hierarchie-Ebenen

Beispiele:

```
Subscribe                    Matches                     Does not match
-----------------------------------------------------------------------------------------

some/thing                   some/thing                  some/thing/else
                                                         some/otherthing

some/+/thing                 some/thing/thing            some/thing
                             some/other/thing            some/totally/other/thing

some/+/+/thing               some/totally/other/thing    some/other/thing
                                                         some/totally/other/thong

some/#                       some/thing                  some
                             some/other/thing            other/thing
                             some/really/other/thing
```

In Folge einer Subscription werden asynchron Nachrichten zugestellt. Dazu muss in der Regel eine Callback Funktion übergeben werden. 

In Javascript sieht das z.B. so aus:

```
client.subscribe('some/+/topic')
client.on('message', function(topic, payload) {
  console.log('received message ', payload, ' on topic ', topic)
})
```

Auch das Subscribe ist abhängig davon, dass der jeweilige Client die entsprechenden Lese-Berechtigungen hat. Bei Cybus ist es sehr wichtig, dass eine Subscription immer eine Teilmenge der erteilten Berechtigungen bildet. Hat ein Client beispielsweise die Berechtigung, auf `some/+/topic` zu lesen, sind beispielsweise folgende Subscriptions gültig: `some/+/topic`, `some/specific/topic`, aber nicht: `some/#`, `#` oder `some/+/+`.

*Achtung Falle!* Standardmäßig beziehen sich Subscriptions nur auf die aktuelle Verbindung. Die meisten Client-Bibliotheken sich selbständig um ein Reconnect im Fall eines Verbindungsabbruchs. Nach einem solchen Reconnect muss in der Regel die `subscribe` Funktion erneut aufgerufen werden, außer es wird das Flag `cleanSession: false` benutzt. 

### Unsubscribe

Sollen auf einem bestimmten Topic keine Daten mehr empfangen werden, kann mit Hilfe des `unsubscribe` Befehls das Abonnement beendet werden. Wichtig: Die Topics inkl. Wildcards im Unsubscribe müssen exakt denen entsprechen, die vorher im Subscribe übergeben wurden.

In Javascript:

```
client.unsubscribe('some/+/topic')
```

### Disconnect


Am Ende einer Verbindung steht wie immer das Disconnect. Es ist nicht notwendig, die Subscriptions vor dem Disconnect abzubauen, außer die Verbindung wurde mit `cleanSession: false` aufgebaut und es sollen keine Offline-Nachrichten gespeichert werden.

```
client.end()
```

## Praktisches Beispiel

Wir haben für euch einen Datenpunkt am Energie-Campus der HAW zum Aufwärmen für den Hackathon öffentlich verfügbar gemacht. Meldet euch mit einem MQTT Client eurer Wahl an unter:

- Server: energie-campus.cybus.io
- Port: 8883
- MQTT over TLS
- Username: warm-up
- Passwort: warm-up-what-the-data-2017
- CleanSession: true

Für den warm-up Client sind folgende Permissions gesetzt:

READ_DATA: io/cybus/energie-campus/energie/+
READ_DATA: warm-up/#
WRITE_DATA: warm-up/#

Hier ein vollständiges Code-Beispiel in Javascript. Forked gern auch unser Beispiel-Projekt auf Github. 

```
const mqtt = require('mqtt')

const client =  mqtt.connect(
  'mqtts://energie-campus.cybus.io', {
  username: 'warm-up',
  password: 'warm-up-what-the-data-2017'
})

client.on('connect', () => {
  client.subscribe('io/cybus/energie-campus/energie/+')
  client.subscribe('warm-up/#')
})

client.on('message', (topic, payload) => {
  console.log(topic, payload)
})

client.publish('warm-up/hello', 'world')

```

