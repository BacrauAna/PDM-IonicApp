M-am gandit ca aplicatia mea sa fie una pentru un coafor/frizerie.
Aceasta o sa contina:
    -imagini cu exemple ce coafuri, manichiura, makeup
    -lista cu ore la care se doreste sa se faca o programare
    -se va permite si autentificare user (asta probabil pentru frizerita) dar utilizatorii nu vor fi obligati sa le logheze daca nu vor
    
Pentru inceput se va afisa o lista cu orele libere.
Utilizatorul va putea sa editeze ora la care doreste sa isi faca programare si pentru ce, iar in functie de ceea ce doreste se vor actualiza si orele de dupa.

ex:
 ora           liber(True/Fale)     serviciul(null la inceput)   nr. de persoane (0 initial)     numele celui ce face programarea(null initial)
10:00 - 10:30        True            
10:30 - 11:00        True
11:00 - 11:30        True
11:30 - 12:00        True
12:00 - 12:30        True
12:30 - 13:00        True
13:00 - 13:30        True


Sa zicem ca o persoana vrea sa se tunda si una sa se vopseasca dar ambele vor fi adaugata de aceeasi persoana
Anumite servicii dureaza mai mult, altele mai putin. In functie de asta se vor schimba si orele ramase libere

pentru ca un vopsit dureaza aprox 3 ore vor fi ocupate 3 ore dupa ce s-a ales intervalul orar (tunsul poate fi facut intre acestea)  

10:00 - 13:00        False              tuns femei + vopsit                   2                     Ana Bacrau
13:00 - 13:30        True                                                     0                     